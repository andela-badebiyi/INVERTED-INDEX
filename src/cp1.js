if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

//read contents of a file
function readFile(file_path){
  var content = "";
  fs = require('fs');
  content = JSON.parse(fs.readFileSync(file_path).toString()); 
  return content;
}

function InvertedIndex(){
  this.content;
}

//inverted index class
InvertedIndex.prototype = {
  constructor: InvertedIndex(),
  //read file using ajax
  read: function(path, callback){
    $.get("http://localhost:8887/"+path,function(data){
      callback(null, data)
    });
  },

  //fetch stop words
  fetchStopWords: function(callback){
    var self = this;
    self.read('stopwords.json', function(err, data){
      self.stopWords = data;
      callback();
    })
  },

  //fetch documents from file
  getContent: function(callback){
    var self = this;
    self.read('content.json', function(err, data){
      self.content = data;
      callback();
    })
  },

  //merge all contents
  mergeContent: function(callback){
    var mergedContent = [];
    var num= 0;
  
    for(i=0; i<this.content.length; i++){
      con = '';
      con += this.content[i].title.toLowerCase();
      con += " ";
      con += this.content[i].text.toLowerCase();
      mergedContent.push(con);
      num = i+1;
    }
    this.mergedContent = mergedContent;
    this.no_of_docs = num;
    callback();
  },

  removePunctuations: function(element){
    var punctuationless = element.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    var finalString = punctuationless.replace(/\s{2,}/g," ");
    return finalString;
  },

  //strip punctuation from mergedcontent
  stripContent: function(callback){
    var stripped = [];
    var self = this;
    
    this.mergedContent.forEach(function(element){
      finalString = self.removePunctuations(element);
      stripped.push(finalString);
    });

    this.stripped = stripped;
    callback();
  },

  //generate unique tokens from merged contents
  generateTokens: function(callback){
    var tokens = [];

    this.stripped.forEach(function(ele){
      allwords = ele.split(" ");
      allwords.forEach(function(element){
        if(!tokens.includes(element.toLowerCase())){
          tokens.push(element.toLowerCase());
        }
      });
    });

    this.tokens = this.removeStopWords(tokens);
    callback();
  },

  //remove stop words from element
  removeStopWords: function(element){
    var results = [];
    var self = this;
    element.forEach(function(ele){
      if(!self.stopWords.includes(ele)){
        results.push(ele);
      }
    });
    return results;
  },

  //create the index
  createIndex: function(callback){
    var indexStructure = [];
    var stripped = this.stripped;

    this.tokens.forEach(function(ele){
      table = [];
      stripped.forEach(function(element, index){
          table[index] = element.includes(ele) ? 1 : 0;
      });
      indexStructure[ele] = table;
    });
    this.indexStructure = indexStructure;
    callback();
  },

  //find
  search: function(query, callback){
    var self = this;
    this.runRequirements(function(){
      //prepare query string for search
      var finalQuery = self.prepareQuery(query);
        
      //fetch dictionary
      var dictionary = self.indexStructure;

      //prepare array that holds hit count
      hitCount = [];
      for(var i=0; i<self.no_of_docs; i++){
        hitCount.push(0);
      }

      //begin search and return results
      finalQuery.forEach(function(element){
        if(dictionary[element] !== undefined){
          for(var i=0; i<dictionary[element].length; i++){
            if(dictionary[element][i] == 1){
              hitCount[i]++;
            }
          }
        }
      });

      result = hitCount.indexOf(Math.max(...hitCount));
      response = '';
      if(Math.max(...hitCount) == 0){
        response = "Your search returns no records";
      } else{
        response = "This search can be found on document: "+(result+1);  
      }
    
      callback(null, response);
      return response;
    });
  },

  //functions needed to run before tests can begin
  runRequirements: function(mycallback){
    self = this;
    
    async.series([
      function(callback){
        self.fetchStopWords(callback);  
      },
      function(callback){
        self.getContent(callback);  
      },
      function(callback){
        self.mergeContent(callback);  
      },
      function(callback){
        self.stripContent(callback);  
      },
      function(callback){
        self.generateTokens(callback);
      },
      function(callback){
        self.createIndex(callback);
        mycallback();
      }
    ]);


  },

  //prep the search query for search
  prepareQuery: function(query){
    var word = this.removePunctuations(query.toLowerCase());
    var splitquery = word.split(' ');
    var finalQuery = this.removeStopWords(splitquery);
    return finalQuery;
  }
};