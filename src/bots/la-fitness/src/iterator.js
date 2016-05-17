import Evaluator from './evaluator';
import Formats from 'data/formats';
import util from 'pokeutil';
import Log from 'log';
import Weaver from './weaver';
import Damage from 'lib/damage';
import NodeReporter from './nodeReporter';

class Iterator {
  constructor() {
  }

  prepare() {
    this.weaver = new Weaver();
  }


  iterateMultiThreaded(state, depth = 5, myOptions = null, yourOptions = null) {
    console.time('iterate');
    if (!myOptions) {
      myOptions = this.getMyOptions(state);
    }
    if (!yourOptions) {
      yourOptions = this.getYourOptions(state);
    }

    let nodes = [];

    const branchOut = (toEvaluate) => {
      nodes = nodes.concat(toEvaluate);
      // console.log('branchout called.', toEvaluate.length);

      while (true) { // eslint-disable-line
        const nextNode = this._getNextNode(nodes);
        if (!nextNode) {
          // console.log('ran out of nodes to check.');
          break;
        }

        // @TODO myOptions changes!!! need to check the node to see what
        // options this node actually has!
        const options = this.getMyOptions(state);

        // Log.debug(`checking a node with fitness ${nextNode.fitness} and depth ${nextNode.depth}`);
        options.forEach((myChoice) => { // eslint-disable-line
          // don't look at switches past the initial node.
          if (nextNode.prevNode && myChoice.species) return;

          this.weaver.enqueue([nextNode, myChoice, util.clone(yourOptions),
            nextNode.depth]);
        });
        nextNode.evaluated = true;
      }
    };
    this.weaver.useCallback(branchOut);
    this.weaver.useEmpty(() => {
      console.log('queue is empty.');
    });

    const initialNode = {
      state,
      fitness: 0,
      depth
    };

    branchOut([initialNode]);

    const intermediate = setInterval(() => {
      NodeReporter.intermediateReporter(nodes);
    }, 1000);

    const res = new Promise((resolve) => {
      setTimeout(() => {
        console.timeEnd('iterate');
        clearInterval(intermediate);
        console.log(nodes.length + ' nodes');
        resolve(nodes);
        this.weaver.die();
      }, 5000);
    });

    return res;
  }

  /**
   * Iterate through each of our choices and the opponent's choices.
   *
   * @param  {[type]} state       The original state.
   * @param  {[type]} myOptions   An array of moves and Pokemon objects
   * representing the choices we might make.
   * @param  {[type]} yourOptions An array of moves and Pokemon objects
   * representing the choices the opponent might make.
   * @return {[type]}             [description]
   */
  iterateSingleThreaded(state, depth = 1, myOptions = null, yourOptions = null) {
    console.time('iterate');
    if (!myOptions) {
      myOptions = this.getMyOptions(state);
    }
    if (!yourOptions) {
      yourOptions = this.getYourOptions(state);
    }

    const initialNode = {
      state: this._makeAssumptions(state),
      fitness: 0,
      depth
    };

    let nodes = [initialNode];
    while (true) { // eslint-disable-line
      const nextNode = this._getNextNode(nodes);
      if (!nextNode) {
        Log.debug('ran out of nodes to check.');
        break;
      }
      Log.debug(`checking a node with fitness ${nextNode.fitness} and depth ${nextNode.depth}`);
      const moreNodes = myOptions.map((myChoice) => { // eslint-disable-line
        Log.debug('my choice:' + JSON.stringify(myChoice));
        const evaluated = Evaluator.evaluateNode(nextNode, myChoice,
          util.clone(yourOptions), depth);
        // console.log(`imagining I chose ${evaluated.myChoice.id} and you chose ` +
        //  `${evaluated.yourChoice.id}: ${evaluated.fitness}`);
        return evaluated;
      });
      nodes = nodes.concat(moreNodes);
      // nextNode.futures = moreNodes;
      nextNode.evaluated = true;
    }
    console.timeEnd('iterate');
    console.log(nodes.length + ' nodes');
    return nodes;
  }

  _makeAssumptions(state) {
    if (state.self.active) {
      state.self.active = Damage.assumeStats(state.self.active);
    }
    if (state.opponent.active) {
      state.opponent.active = Damage.assumeStats(state.opponent.active);
    }
    return state;
  }

  getMyOptions(state) {
    let switches = [];
    if (!state.self.active.maybeTrapped) {
      switches = state.self.reserve.filter(mon => {
        return !mon.active && !mon.dead;
      });
    }

    let moves = [];
    if (!state.forceSwitch && !state.teamPreview && state.self.active &&
      state.self.active.moves) {
      moves = util.clone(state.self.active.moves)
        .filter(move => !move.disabled);
    }
    return switches.concat(moves);
  }

  // _checkSituationalMoves(state, mon, move) {
  //   switch (move.id) {
  //   case 'fakeout':
  //     if (state.events.find(event => event.move === 'fakeout' &&
  //       event.from === state.mon.species )) {
  //       return false;
  //     }
  //     break;
  //   default:
  //     break;
  //   }
  //   return true;
  // }

  getYourOptions(state) {
    // @TODO maybe consider switches...
    // @TODO consider history
    // @TODO consider Choice Items
    if (!state.opponent.active || !state.opponent.active.species) return null;
    const moves = Formats[util.toId(state.opponent.active.species)].randomBattleMoves;
    return moves.map(move => util.researchMoveById(move));
  }

  /**
   * Return the valid node with the highest fitness.
   *
   * @param  {[type]} nodes [description]
   * @return {[type]}       [description]
   */
  _getNextNode(nodes) {
    const choices = nodes.filter(node => {
      if (node.evaluated) return false;
      if (node.terminated) return false;
      return true;
    }).sort((a, b) => b.fitness - a.fitness);
    if (choices.length === 0) return null;
    return choices[0];
  }
}

export default new Iterator();
