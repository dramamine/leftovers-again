'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _evaluator = require('./evaluator');

var _evaluator2 = _interopRequireDefault(_evaluator);

var _formats = require('data/formats');

var _formats2 = _interopRequireDefault(_formats);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

var _weaver = require('./weaver');

var _weaver2 = _interopRequireDefault(_weaver);

var _damage = require('lib/damage');

var _damage2 = _interopRequireDefault(_damage);

var _nodeReporter = require('./nodeReporter');

var _nodeReporter2 = _interopRequireDefault(_nodeReporter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Iterator {
  constructor() {}

  prepare() {
    this.weaver = new _weaver2.default();
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

    const branchOut = toEvaluate => {
      nodes = nodes.concat(toEvaluate);
      // console.log('branchout called.', toEvaluate.length);

      while (true) {
        // eslint-disable-line
        const nextNode = this._getNextNode(nodes);
        if (!nextNode) {
          // console.log('ran out of nodes to check.');
          break;
        }

        // @TODO myOptions changes!!! need to check the node to see what
        // options this node actually has!
        const options = this.getMyOptions(state);

        // Log.debug(`checking a node with fitness ${nextNode.fitness} and depth ${nextNode.depth}`);
        options.forEach(myChoice => {
          // eslint-disable-line
          // don't look at switches past the initial node.
          if (nextNode.prevNode && myChoice.species) return;

          this.weaver.enqueue([nextNode, myChoice, _pokeutil2.default.clone(yourOptions), nextNode.depth]);
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
      _nodeReporter2.default.intermediateReporter(nodes);
    }, 1000);

    const res = new Promise(resolve => {
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
    while (true) {
      // eslint-disable-line
      const nextNode = this._getNextNode(nodes);
      if (!nextNode) {
        _log2.default.debug('ran out of nodes to check.');
        break;
      }
      _log2.default.debug(`checking a node with fitness ${ nextNode.fitness } and depth ${ nextNode.depth }`);
      const moreNodes = myOptions.map(myChoice => {
        // eslint-disable-line
        _log2.default.debug('my choice:' + JSON.stringify(myChoice));
        const evaluated = _evaluator2.default.evaluateNode(nextNode, myChoice, _pokeutil2.default.clone(yourOptions), depth);
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
      state.self.active = _damage2.default.assumeStats(state.self.active);
    }
    if (state.opponent.active) {
      state.opponent.active = _damage2.default.assumeStats(state.opponent.active);
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
    if (!state.forceSwitch && !state.teamPreview && state.self.active && state.self.active.moves) {
      moves = _pokeutil2.default.clone(state.self.active.moves).filter(move => !move.disabled);
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
    const moves = _formats2.default[_pokeutil2.default.toId(state.opponent.active.species)].randomBattleMoves;
    return moves.map(move => _pokeutil2.default.researchMoveById(move));
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

exports.default = new Iterator();