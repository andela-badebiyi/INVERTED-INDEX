describe('Read Book Data', function(){
    var invertedIndex = new InvertedIndex();
    var content;

    beforeEach(function(done){
        invertedIndex.getContent(function(){
            content = invertedIndex.content;
            done();
        });
    });

    it("should be able to read the book data", function(){
        expect(content).not.toBe(null);    
    });

});

describe('Read Stop Words', function(){
    var invertedIndex = new InvertedIndex();
    var content;

    beforeEach(function(done){
        invertedIndex.fetchStopWords(function(){
            content = invertedIndex.stopWords;
            done();
        });
    });

    it("should be able to read stop words", function(){
        expect(content).not.toBe(null); 
    });
});


describe('Populate Index', function(){
    var invertedIndex = new InvertedIndex();
    var index;

    beforeEach(function(done){
        invertedIndex.runRequirements(function(){
            index = invertedIndex.indexStructure;
            done();
        });
    });

    it("should display the index after file has been read", function(){
        expect(index).not.toBe(null);
    });

    it('should be undefined for keys that are not in dictionary',
        function(){
            expect(index['lalallalalal']).toBeUndefined();        
    });

    it("string keys should map objects in database", function(){
        expect(index['alice']).toEqual([1, 0, 0]);
        expect(index['alliance']).toEqual([0, 1, 0]);
    });
});

describe('Search dictionary', function(){
    var invertedIndex = new InvertedIndex();

    it("should not be able to find 'ayamatanga'", function(done){
        invertedIndex.search('ayamatanga', function(err, data){
            expect(data).toBe('Your search returns no records');
            done();    
        });
    });

    it("should be able to find 'alice' in document 1", function(done){
        invertedIndex.search('Alice', function(err, data){
            expect(data).toBe('This search can be found on document: 1');
            done();
        });
    });

    it("should be able to return document 3 for search 'question for gods and men'",
        function(done){
            invertedIndex.search('question for gods and men', function(err, data){
            expect(data).toBe('This search can be found on document: 3');
            done();
        });
    })

    it("should be able to return document 2 for search 'the unsual alliance of gods'", 
        function(done){
            invertedIndex.search('the unusual alliance of gods', function(err, data){
            expect(data).toBe('This search can be found on document: 2');
            done();
        });
    });
});