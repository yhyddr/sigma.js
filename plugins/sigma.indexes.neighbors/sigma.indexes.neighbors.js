/**
 * This plugin contains some basic indexes to write any graph traversal
 * algorithm. It will keep updated during the lifecycle of the graph for each
 * node references to its incoming, outgoing and undirected edges.
 *
 * You can check the "neighborhoods" plugin to see how to use them.
 */
(function() {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  sigma.classes.graph.addIndex(
    'inNeighborsIndex',
    {
      constructor: function() {
        this.inNeighborsIndex = Object.create(null);
      },
      clear: function() {
        sigma.utils.emptyObject(this.inNeighborsIndex);
      },
      kill: function() {
        delete this.inNeighborsIndex;
      },
      addNode: function(node) {
        this.inNeighborsIndex[node.id] = Object.create(null);
      },
      addEdge: function(edge) {
        if (!this.inNeighborsIndex[edge.target][edge.source])
          this.inNeighborsIndex[edge.target][edge.source] = Object.create(null);
        this.inNeighborsIndex[edge.target][edge.source][edge.id] = edge;
      },
      dropNode: function(id) {
        delete this.inNeighborsIndex[id];
        for (var k in this.nodesIndex)
          delete this.inNeighborsIndex[k][id];
      },
      dropEdge: {
        before: true,
        fn: function(id) {
          var edge = this.edgesIndex[id];

          if (!edge)
            return;

          delete this.inNeighborsIndex[edge.target][edge.source][edge.id];
          if (!Object.keys(this.inNeighborsIndex[edge.target][edge.source]).length)
            delete this.inNeighborsIndex[edge.target][edge.source];
        }
      }
    }
  );

  sigma.classes.graph.addIndex(
    'outNeighborsIndex',
    {
      constructor: function() {
        this.outNeighborsIndex = Object.create(null);
      },
      clear: function() {
        sigma.utils.emptyObject(this.outNeighborsIndex);
      },
      kill: function() {
        delete this.outNeighborsIndex;
      },
      addNode: function(node) {
        this.outNeighborsIndex[node.id] = Object.create(null);
      },
      addEdge: function(edge) {
        if (!this.outNeighborsIndex[edge.source][edge.target])
          this.outNeighborsIndex[edge.source][edge.target] = Object.create(null);
        this.outNeighborsIndex[edge.source][edge.target][edge.id] = edge;
      },
      dropNode: function(id) {
        delete this.outNeighborsIndex[id];
        for (var k in this.nodesIndex)
          delete this.outNeighborsIndex[k][id];
      },
      dropEdge: {
        before: true,
        fn: function(id) {
          var edge = this.edgesIndex[id];

          if (!edge)
            return;

          delete this.outNeighborsIndex[edge.source][edge.target][edge.id];
          if (!Object.keys(this.outNeighborsIndex[edge.source][edge.target]).length)
            delete this.outNeighborsIndex[edge.source][edge.target];
        }
      }
    }
  );

  sigma.classes.graph.addIndex(
    'allNeighborsIndex',
    {
      constructor: function() {
        this.allNeighborsIndex = Object.create(null);
      },
      clear: function() {
        sigma.utils.emptyObject(this.allNeighborsIndex);
      },
      kill: function() {
        delete this.allNeighborsIndex;
      },
      addNode: function(node) {
        this.allNeighborsIndex[node.id] = Object.create(null);
      },
      addEdge: function(edge) {
        if (!this.allNeighborsIndex[edge.source][edge.target])
          this.allNeighborsIndex[edge.source][edge.target] =
            Object.create(null);
        this.allNeighborsIndex[edge.source][edge.target][edge.id] = edge;

        if (edge.target !== edge.source) {
          if (!this.allNeighborsIndex[edge.target][edge.source])
            this.allNeighborsIndex[edge.target][edge.source] =
              Object.create(null);
          this.allNeighborsIndex[edge.target][edge.source][edge.id] = edge;
        }
      },
      dropNode: function(id) {
        delete this.allNeighborsIndex[id];
        for (var k in this.nodesIndex)
          delete this.allNeighborsIndex[k][id];
      },
      dropEdge: {
        before: true,
        fn: function(id) {
          var edge = this.edgesIndex[id];

          if (!edge)
            return;

          delete this.allNeighborsIndex[edge.source][edge.target][edge.id];
          if (!Object.keys(this.allNeighborsIndex[edge.source][edge.target]).length)
            delete this.allNeighborsIndex[edge.source][edge.target];

          if (edge.target !== edge.source) {
            delete this.allNeighborsIndex[edge.target][edge.source][edge.id];
            if (!Object.keys(this.allNeighborsIndex[edge.target][edge.source]).length)
              delete this.allNeighborsIndex[edge.target][edge.source];
          }
        }
      }
    }
  );
}).call(window);
