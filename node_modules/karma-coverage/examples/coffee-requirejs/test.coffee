define ['calculator'], (calculator) ->

  describe 'calculator', ->

    it 'should pass', ->
      true is true

    it 'should work', ->
      calculator.plus(1, 2) is 3
