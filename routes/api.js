'use strict';
// 1. Import SudokuSolver module
const SudokuSolver = require('../controllers/sudoku-solver.js');

// 2.Export SudokuSolver module to Express.js App
module.exports = function (app) {
  let solver = new SudokuSolver();
  
  // 2.1 Defining the /api/check route
  app.route('/api/check')
    .post((req, res) => {
      // 2.1.1 Extract data from request body
      let {value, coordinate, puzzle} = req.body
      // 2.1.2 Regex & Validation
      let alphaTest = /[a-i]/gi
      let numberTest =  /^[1-9]$/g
      const regex = /^[1-9.]+$/ 
      // 2.1.3 Checking for missing required fields
      if(!value || !coordinate || !puzzle) return res.json({error: 'Required field(s) missing'})
      // 2.1.4 Checking for invalid characters in puzzle
      if(!regex.test(puzzle)) return res.json({error: 'Invalid characters in puzzle'})
      // 2.1.5 Checking length of puzzle
      if(puzzle.length !== 81) return res.json({error: 'Expected puzzle to be 81 characters long'})
      
      // 2.2 Validating coordinate format (Length exactly 2, first character should be a letter from 'a' to 'i' and second character should be a digit from 1 to 9)
      const splitCoord = coordinate.split('')
      if(splitCoord.length > 2 || splitCoord.length === 1 || !alphaTest.test(splitCoord[0]) || !numberTest.test(splitCoord[1])) return res.json({error: 'Invalid coordinate'})
      //JSON response if 2.2 validation is not met
      if(!value.match(numberTest)) return res.json({error: 'Invalid value'})

      // 2.3 Checking the placement of the value in the row, column, and region
      let rowPlace = solver.checkRowPlacement(puzzle, splitCoord[0], splitCoord[1],value)
      let colPlace = solver.checkColPlacement(puzzle, splitCoord[0], splitCoord[1],value)
      let regionPlace = solver.checkRegionPlacement(puzzle, splitCoord[0], splitCoord[1],value)
      // 2.4 Check for conflicts
      let conflicts = []

      if(rowPlace && colPlace && regionPlace) return res.json({valid: true})
      else{
        if(!rowPlace) conflicts.push('row')
        if(!colPlace) conflicts.push('column')
        if(!regionPlace) conflicts.push('region')
        return res.json({valid: false, conflict: conflicts})
      }
    });

  // 3. Defining the /api/solve route
  app.route('/api/solve')
    .post((req, res) => {
      const {puzzle} = req.body
      const regex = /^[1-9.]+$/ 

      if(!puzzle) return res.json({error: 'Required field missing'})
      if(!regex.test(puzzle)) return res.json({error: 'Invalid characters in puzzle'})
      if(puzzle.length !== 81) return res.json({error: 'Expected puzzle to be 81 characters long'})
      
      let solvedString = solver.solve(puzzle)
      if(!solvedString) res.json({error: 'Puzzle cannot be solved'})
      else return res.json({solution: solvedString})
    });
};