describe('Read Book Data', function(){
    var invertedIndex = new Index();

    beforeEach(function(done){
        invertedIndex.createIndex("http://localhost:8887/content.json", function(){
          done();
        });
    });

    it("ensure that json array is not empty", function(){
        expect(invertedIndex.content).not.toEqual([]);
    });
});

describe('populate index', function(){
  var invertedIndex = new Index();

  beforeEach(function(done){
      invertedIndex.createIndex("http://localhost:8887/content.json", function(){
        done();
      });
  });

  it("ensure that the index is created was json has been read", function(){
      expect(invertedIndex.getIndex()).not.toBe(null);
      expect(invertedIndex.getIndex()).not.toBe(undefined);
  });

  it("ensure that the index is correct", function(){
    expect(invertedIndex.index.alice).toEqual([1,0,0]);
    expect(invertedIndex.index.men).toEqual([0,0,1]);
  });
});

describe('search Index', function(){
  var invertedIndex = new Index();

  beforeEach(function(done){
      invertedIndex.createIndex("http://localhost:8887/content.json", function(){
        done();
      });
  });

  it("ensures index returns the correct result", function(){
    expect(invertedIndex.searchIndex('alice')).toEqual([0]);
    expect(invertedIndex.searchIndex('lord of the rings for alice')).toEqual([1, 0]);
    expect(invertedIndex.searchIndex('ayamatanga')).toEqual([]);
    expect(invertedIndex.searchIndex('rabbit hole question things gods man')).toEqual([2, 0, 1]);
    expect(invertedIndex.searchIndex('rabbit hole question for gods man')).toEqual([0, 2, 1]);
    expect(invertedIndex.searchIndex(['alice', 'rabbit', 'hole', 'man'])).toEqual([0, 1]);
  });
});
