import 'request'

var qubits = [];
var classical_bits = [];

var valueOfQubit = function(qubit_index) {
  return qubits[qubit_index] || 0;
};

var valueOfClassical = function(classical_index) {
  return classical_bits[classical_index] || 0;
};

var gates = {
  H: function(qubit_index) {
    // apply H-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'H ' + qubit_index;
  },
  
  I: function(qubit_index) {
    // apply I-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'I ' + qubit_index;
  },
  
  S: function(qubit_index) {
    // apply S-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'S ' + qubit_index;
  },
  
  T: function(qubit_index) {
    // apply T-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'T ' + qubit_index;
  },
  
  X: function(qubit_index) {
    // apply X-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'X ' + qubit_index;
  },
  
  Y: function(qubit_index) {
    // apply Y-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'Y ' + qubit_index;
  },
  
  Z: function(qubit_index) {
    // apply Z-gate to qubit-index
    this.qubit = qubit_index;
    this.code = 'Z ' + qubit_index;
  },
  
  PHASE: function(phase, qubit_index) {
    this.phase = phase;
    this.qubit = qubit_index;
    this.code = 'PHASE ' + qubit_index;
  },
  CPHASE00: function(alpha, qubit_index) {
    this.phase = alpha;
    this.qubit = qubit_index;
    this.code = 'CPHASE00 ' + qubit_index;
  },
  CPHASE01: function(alpha, qubit_index) {
    this.phase = alpha;
    this.qubit = qubit_index;
    this.code = 'CPHASE01 ' + qubit_index;
  },
  CPHASE10: function(alpha, qubit_index) {
    this.phase = alpha;
    this.qubit = qubit_index;
    this.code = 'CPHASE10 ' + qubit_index;
  },
  CPHASE: function(alpha, qubit_index) {
    this.phase = alpha;
    this.qubit = qubit_index;
    this.code = 'CPHASE ' + qubit_index;
  },
  RX: function(phase, qubit_index) {
    this.phase = phase;
    this.qubit = qubit_index;
    this.code = 'RX ' + qubit_index;
  },
  RY: function(phase, qubit_index) {
    this.phase = phase;
    this.qubit = qubit_index;
    this.code = 'RY ' + qubit_index;
  },
  RZ: function(phase, qubit_index) {
    this.phase = phase;
    this.qubit = qubit_index;
    this.code = 'RZ ' + qubit_index;
  },
  CNOT: function(qubit_index) {
    this.qubit = qubit_index;
    this.code = 'CNOT ' + qubit_index;
  },
  CCNOT: function(qubit_index) {
    this.qubit = qubit_index;
    this.code = 'CCNOT ' + qubit_index;
  },
  SWAP: function(qubit_index) {
    this.qubit = qubit_index;
    this.code = 'SWAP ' + qubit_index;
  },
  CSWAP: function(qubit_index) {
    this.qubit = qubit_index;
    this.code = 'CSWAP ' + qubit_index;
  },
  ISWAP: function(qubit_index) {
    this.qubit = qubit_index;
    this.code = 'ISWAP ' + qubit_index;
  },
  PSWAP: function(alpha, qubit_index) {
    this.phase = alpha;
    this.qubit = qubit_index;
    this.code = 'PSWAP ' + qubit_index;
  }
};

// not supporting: defgate

var Program = function() {
  this.src = [];
};
Program.prototype = {
  inst: function() {
    for (var i in arguments) {
      var formed_instruction = arguments[i];
      this.src.push(formed_instruction);
    }
  },
  
  measure: function(qubit_index, classical_index) {
    this.src.push('MEASURE ' + qubit_index + ' [' + classical_index + ']');
  },
  
  code: function() {
    var quil = '';
    for (var a = 0; a < this.src.length; a++) {
      if (typeof this.src[a] === 'object') {
        quil += this.src[a].code;
      } else {
        quil += this.src[a];
      }
      quil += '\n';
    }
    return quil;
  },
  
  concat: function(otherProgram) {
    this.src.concat(otherProgram.src);
  },
  
  pop: function() {
    this.src.pop();
  },
  
  run: function(callback) {
    for (var a = 0; a < this.src.length; a++) {
      var instruction = this.src[a];
      if (typeof instruction === 'object') {
        if (instruction.code[0] === 'X') {
          qubits[instruction.qubit] = 1;
        } else if (instruction.code[0] === 'H') {
          qubits[instruction.qubit] = ((Math.random() > 0.5) ? 1 : 0);
        }
      } else {
        classical_bits[0] = qubits[0];
      }
    }
    callback(null);
  }
};

// not supporting: wavefunction

var QVM = function() { };
QVM.prototype = {
  runOnce: function(callback) {
    let cix = this.classical_indexes;
    this.program.run(function(err) {
      if (err) {
        return callback(err);
      }
      
      var returns = [];
      function readIndex(i) {
        if (i >= cix.length) {
          return callback(null, returns);
        }
        returns.push(valueOfClassical(cix[i]));
        readIndex(i + 1);
      }
      readIndex(0);
    });
  },
  
  run: function(program, classical_indexes, iterations, callback) {
    this.program = program;
    this.classical_indexes = classical_indexes;

    let responses = [];
    if (!iterations || isNaN(iterations * 1)) {
      iterations = 1;
    }
    
    var runMe = (function(i) {
      if (i >= iterations) {
        console.log('too big');
        return callback(null, responses);
      }
      this.runOnce((function(err, response) {
        if (err) {
          return callback(err, []);
        }
        responses.push(response);
        runMe(i + 1);
      }).bind(this));
    }).bind(this);
    runMe(0);
  },
  
  wavefunction: function() {
    // debugging function on VMs
  }
};

export { gates, Program, QVM };