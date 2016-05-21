'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _matchstatus = require('reporters/matchstatus');

var _matchstatus2 = _interopRequireDefault(_matchstatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NodeReporter {
  report(node) {
    // console.log('trying to report on this node:', node);
    const thisOccurrence = this._getNodeString(node);
    if (node.prevNode) {
      return this.report(node.prevNode) + '\n' + thisOccurrence;
    }
    return thisOccurrence;
  }

  _getNodeString(node) {
    if (!node.myChoice) return '';
    const mine = node.myChoice ? node.myChoice.id : '??';
    const yours = node.yourChoice ? node.yourChoice.id : '??';
    // console.log(JSON.stringify(node));
    return `me: ${ mine }, you: ${ yours }, fitness: ${ node.fitness }, depth: ${ node.depth }
    (my hp: ${ Math.round(node.state.self.active.hppct) } vs your hp: ${ Math.round(node.state.opponent.active.hppct) })`;
  }

  reportCondensed(node) {
    const lines = [];
    lines.push(`fitness: ${ Math.round(node.fitness, 2) }`);
    lines.push(`moves chosen: ${ this.recursiveMoves(node) }`);
    lines.push(`(my dudes hp: ${ node.state.self.active.species } ${ node.state.self.active.hp } vs your hp: ${ node.state.opponent.active.species } ${ node.state.opponent.active.hppct })`);
    return lines.join('\n');
  }
  recursiveMatchStatuses(node) {
    if (node.prevNode) {
      this.recursiveMatchStatuses(node.prevNode);
    }
    _matchstatus2.default.report(node.state);
  }

  recursiveMoves(node) {
    const mine = node.myChoice ? node.myChoice.id : '??';
    if (node.prevNode && node.prevNode.myChoice) {
      return this.recursiveMoves(node.prevNode) + ',' + mine;
    }
    return mine;
  }

  intermediateReporter(nodes) {
    console.log('INTERMEDIATE NODE REPORTER: ' + nodes.length + ' nodes');
    const sorted = nodes.filter(node => node.evaluated || node.terminated).sort((a, b) => b.fitness - a.fitness);
    if (!sorted[0]) return;
    const bestNode = sorted[0];

    console.log('best node:');
    console.log(this.reportCondensed(bestNode));
    this.recursiveMatchStatuses(bestNode);

    // find a node that doesn't have the same initial choice
    const firstChoice = this.getFirstChoice(bestNode);
    const runnerup = sorted.find(node => this.getFirstChoice(node) !== firstChoice);
    if (runnerup) {
      console.log('2nd best node:');
      console.log(this.reportCondensed(runnerup));
      this.recursiveMatchStatuses(runnerup);
    } else {
      console.log('did not find another node with a different choice.');
    }
  }

  getFirstChoice(node) {
    let earlier = node;
    while (earlier.prevNode && earlier.prevNode.myChoice) {
      earlier = earlier.prevNode;
    }
    return earlier.myChoice.id;
  }

}

exports.default = new NodeReporter();