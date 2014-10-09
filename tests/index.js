// methods should throw errors when arguments are invalid

var should = require("should");

describe('default syntax', function() {

    var parser = require("../")();

    describe('single line', function() {

        describe('valid', function() {

            describe('full syntax', function() {

                describe("one action", function() {

                    var text = "rotate 45 @300ms (mark1)",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: "mark1",
                                duration: 300,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

                describe("multiple actions", function() {

                    var text = "rotate 45, scale 2, fade 0.5 @300ms (mark1)",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: "mark1",
                                duration: 300,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }, {
                                    name: "scale",
                                    params: ["2"]
                                }, {
                                    name: "fade",
                                    params: ["0.5"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

            });

            describe('partial syntax', function() {

                describe("no duration units", function() {

                    var text = "rotate 45 @300 (mark1)",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: "mark1",
                                duration: 300,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

                describe("no duration", function() {

                    var text = "rotate 45 (mark1)",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: "mark1",
                                duration: null,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

                describe("no tag", function() {

                    var text = "rotate 45 @300",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: null,
                                duration: 300,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

                describe("no duration and no tag", function() {

                    var text = "rotate 45",
                        tree = {
                            tag: null,
                            duration: null,
                            actions: [],
                            lineIdx: -1,
                            children: [{
                                lineIdx: 0,
                                tag: null,
                                duration: null,
                                actions: [{
                                    name: "rotate",
                                    params: ["45"]
                                }],
                                children: []
                            }]
                        };
                    describe(text, function() {

                        it('should create the correct tree', function() {
                            parser(text).should.eql(tree);
                        });

                    });

                });

            });

            describe("with a comment", function() {

                var text = "rotate 45 @250ms (mark 1) # comment foo bar @444",
                    tree = {
                        tag: null,
                        duration: null,
                        actions: [],
                        lineIdx: -1,
                        children: [{
                            lineIdx: 0,
                            tag: "mark 1",
                            duration: 250,
                            actions: [{
                                name: "rotate",
                                params: ["45"]
                            }],
                            children: []
                        }]
                    };
                describe(text, function() {

                    it('should create the correct tree', function() {
                        parser(text).should.eql(tree);
                    });

                });

            });

        });

    });

    describe('multi line', function() {

        var fs = require('fs');

        describe('valid', function() {

            describe('with root', function() {

                var text, tree;
                before(function(done) {
                    fs.readFile('./tests/valid_with_root.apack', {
                        encoding: 'utf8'
                    }, function(err, data) {
                        if (err) return done(err);
                        text = data;
                        done();
                    });
                });

                before(function(done) {
                    fs.readFile('./tests/valid_with_root.json', {
                        encoding: 'utf8'
                    }, function(err, data) {
                        if (err) return done(err);
                        tree = JSON.parse(data);
                        done();
                    });
                });

                it('should create the correct tree', function() {
                    parser(text).should.eql(tree);
                });

            });

        });

    });

});
