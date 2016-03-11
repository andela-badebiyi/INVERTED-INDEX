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

var Index = function(){
};

Index.prototype.createIndex = function(path, callback){
  var self = this;
  self.fetchStopWords(function(err, data){
      self.getContent(path, function(err, data){
        self.mergeContent();
        self.stripContent();
        self.generateTokens();
        self.index = self.constructIndex();
        callback();
      });
  })
};

Index.prototype.getIndex = function(){
  return this.index;
};

Index.prototype.searchIndex = function(query){
  var self = this;
  //prepare query string for search
  var finalQuery = self.prepareQuery(query);

  //fetch dictionary
  var dictionary = self.index;

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

  result = self.sortResult(hitCount);
  return result;
};

Index.prototype.readFile = function(path, callback){
  $.get(path,function(data){
    callback(null, data)
  });
};

Index.prototype.fetchStopWords = function(callback){
  var self = this;
  self.readFile("http://localhost:8887/"+'stopwords.json', function(err, data){
    self.stopWords = data;
    callback();
  });
};

Index.prototype.getContent = function(path, callback){
  var self = this;
  self.readFile(path, function(err, data){
    self.content = data;
    callback();
  });
};

Index.prototype.mergeContent = function(){
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
};

Index.prototype.removePunctuations = function(element){
  var punctuationless = element.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  var finalString = punctuationless.replace(/\s{2,}/g," ");
  return finalString;
};

Index.prototype.stripContent = function(){
  var stripped = [];
  var self = this;

  this.mergedContent.forEach(function(element){
    finalString = self.removePunctuations(element);
    stripped.push(finalString);
  });

  this.stripped = stripped;
};

Index.prototype.generateTokens = function(){
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
};

Index.prototype.removeStopWords = function(element){
  var results = [];
  var self = this;
  element.forEach(function(ele){
    if(!self.stopWords.includes(ele)){
      results.push(ele);
    }
  });
  return results;
};

Index.prototype.prepareQuery = function(query){
  var finalQuery;
  if(query instanceof Array){
    finalQuery = query.join(" ").toLowerCase().split(" ");
  } else {
    var word = this.removePunctuations(query.toLowerCase());
    var splitquery = word.split(' ');
    finalQuery = this.removeStopWords(splitquery);
  }
  return finalQuery;
};

Index.prototype.constructIndex = function(){
    var indexStructure = [];
    var stripped = this.stripped;

    this.tokens.forEach(function(ele){
      table = [];
      stripped.forEach(function(element, index){
          table[index] = element.includes(ele) ? 1 : 0;
      });
      indexStructure[ele] = table;
    });
    return indexStructure;
  };

Index.prototype.sortResults = function(data){
    unsorted = data.slice(0, data.length);
    result = [];
    sorted = data.sort().reverse();
    sorted.forEach(function(element, index){
      if(element !== 0) result.push(unsorted.indexOf(element));
    });
    return result;
};

Index.prototype.sortResult = function(data){
  var i=0, result = [], val;
  for(i; i<data.length; i++){
    if(data[i] == 0) continue;
    val = data.indexOf(Math.max(...data));
    result.push(val);
    data[val] = -1;
  }
  return result;
}
