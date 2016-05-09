function generateGrid (rowCount, columnCount) {
  var grid = []

  for (var r = 0; r < rowCount; r++) {
    var row = { id: r, items: [] }
    for (var c = 0; c < columnCount; c++) {
      row.items.push({ id: (r + '-' + c) })
    }
    grid.push(row)
  }

  return grid
}

const gridData = generateGrid(10000, 10)

var perfMixin = {
  computed: {
    performance: {
      cached: false,
      get: function () {
        return (root.performance.now() - root.s).toFixed(2)
      }
    }
  }
}

var gridComponent = {
  template: '<div><h1>Render time: {{ performance }}ms</h1><my-table></my-table></div>',
  mixins: [perfMixin],
  components: {
    myTable: {
      data: function () {
        return {
          grid: gridData
        }
      },
      template: '<table width="100%" cellspacing="2"><row v-for="row in grid"></row></table>',
      components: {
        row: {
          props: ['row'],
          mixins: [perfMixin],
          template: '<tr><th>{{ performance }}ms</th><column v-for="item in row" value="item"></column></tr>',
          components: {
            column: {
              props: ['value'],
              mixins: [perfMixin],
              template: '<td class="item">{{ performance }}ms</td>'
            }
          }
        }
      }
    }
  }
}

if (module && module.exports) {
  module.exports = gridComponent
}
