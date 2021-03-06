/* global describe, it, beforeEach */
var gpx = require('../lib/metalsmith/gpxparser'),
    assert = require('assert'),
    moment = require('moment'),
    sinon = require('sinon'),
    fs = require('fs');

describe('Metalsmith gpxparser', function () {
    var ms;

    function gpxFileContent(fileName) {
        return fs.readFileSync(__dirname + '/fixtures/gpxparser/tracks/' + fileName);
    }

    beforeEach(function () {
        ms = {source: function () { return __dirname + '/fixtures/gpxparser'; }};
    });


    it('should ignore files without a "gpx" entry', function (done) {
        var files = {"testFile1": {}, "testFile2": {}},
            spy = sinon.spy(ms, 'source');

        gpx()(files, ms, function (err) {
            assert.ok(typeof err === 'undefined');
            assert.equal(
                0, Object.keys(files.testFile1).length,
                "files.testFile should be intact"
            );
            assert.equal(
                0, Object.keys(files.testFile2).length,
                "files.testFile should be intact"
            );
            assert.equal(
                0, spy.callCount, "The files should have been ignored"
            );
            done();
        });
    });

    it('should create the data.js entry', function (done) {
        var date = '2012-01-05',
            files = {
                'tracks/test1.md': {'gpx': 'test1.gpx', updated: date},
                'tracks/test1.gpx': {contents: gpxFileContent('test1.gpx')},
            };

        gpx()(files, ms, function (err) {
            var file = files['tracks/test1.md'],
                data = files['tracks/data-' + moment(date).unix() + '.js'],
                dataContent;

            assert.ok(typeof err === 'undefined');
            assert.ok(typeof data === 'object');
            assert.ok(data.template === false);
            assert.ok(data.permalink === false);
            dataContent = JSON.parse(data.contents);

            assert.equal(file.title, dataContent.title);
            assert.equal(file.distance, dataContent.distance);
            assert.strictEqual(file.loop, dataContent.loop);
            assert.deepEqual(file.elevation, dataContent.elevation);
            assert.deepEqual(file.bounds, dataContent.bounds);
            assert.deepEqual(file.points, dataContent.points);
            done();
        });
    });

    describe('error handling', function () {
        it('should handle non existing gpx file', function (done) {
            var files = {'tracks/testFile.md': {'gpx': 'doesnotexist.gpx'}};

            gpx()(files, ms, function (err) {
                assert.ok(err instanceof Error);
                done();
            });
        });

        it('should handle invalid xml file', function (done) {
            var files = {'tracks/testFile.md': {'gpx': 'invalid.gpx'}};

            gpx()(files, ms, function (err) {
                assert.ok(err instanceof Error);
                done();
            });
        });
    });

    describe('color', function () {
        it('should generate a color', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'test1.gpx'},
                    'tracks/test1.gpx': {contents: gpxFileContent('test1.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    color = file.color;

                assert.ok(typeof err === 'undefined');
                assert.ok(typeof color === 'string');
                assert.ok(color.match(/^#[0-9A-F]{6}$/i));
                done();
            });
        });
    });

    describe('parsing', function () {
        it('should parse a complete gpx file', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'test1.gpx'},
                    'tracks/test1.gpx': {contents: gpxFileContent('test1.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    bounds = file.bounds;

                assert.ok(typeof err === 'undefined');

                assert.equal("Test 1", file.title);
                assert.equal("2014-05-23T07:53:00Z", file.created);
                assert.strictEqual(768.2, file.elevation.max);
                assert.strictEqual(200.1, file.elevation.min);
                assert.strictEqual(228, file.elevation.loss);
                assert.strictEqual(568, file.elevation.gain);
                assert.strictEqual(99.4, file.distance);

                assert.strictEqual(46.242022, bounds.minlat);
                assert.strictEqual(46.31515, bounds.maxlat);
                assert.strictEqual(5.364807, bounds.minlon);
                assert.strictEqual(5.405417, bounds.maxlon);

                assert.strictEqual(false, file.loop);
                done();
            });
        });

        it('should ignore points without elevation', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'noele.gpx'},
                    'tracks/noele.gpx': {contents: gpxFileContent('noele.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    bounds = file.bounds;

                assert.ok(typeof err === 'undefined');

                assert.equal("Test 1", file.title);
                assert.equal("2014-05-23T07:53:00Z", file.created);
                assert.strictEqual(740.3, file.elevation.max);
                assert.strictEqual(200.1, file.elevation.min);
                assert.strictEqual(200, file.elevation.loss);
                assert.strictEqual(540, file.elevation.gain);
                assert.strictEqual(99.3, file.distance);

                assert.strictEqual(46.242022, bounds.minlat);
                assert.strictEqual(46.31515, bounds.maxlat);
                assert.strictEqual(5.364807, bounds.minlon);
                assert.strictEqual(5.405417, bounds.maxlon);
                done();
            });
        });


        it('should handle a gpx without bounds', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'nobounds.gpx'},
                    'tracks/nobounds.gpx': {contents: gpxFileContent('nobounds.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    bounds = file.bounds;

                assert.ok(typeof err === 'undefined');

                assert.equal("Test 1", file.title);
                assert.equal("2014-05-23T07:53:00Z", file.created);
                assert.strictEqual(768.2, file.elevation.max);
                assert.strictEqual(200.1, file.elevation.min);
                assert.strictEqual(228, file.elevation.loss);
                assert.strictEqual(568, file.elevation.gain);
                assert.strictEqual(99.4, file.distance);

                assert.strictEqual(46.250508, bounds.minlat);
                assert.strictEqual(47, bounds.maxlat);
                assert.strictEqual(5.317694, bounds.minlon);
                assert.strictEqual(6, bounds.maxlon);
                done();
            });
        });

        it('should fallback to the metadata name if the track name is not set', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'metadataname.gpx'},
                    'tracks/metadataname.gpx': {contents: gpxFileContent('metadataname.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.equal("Metadata name", file.title);
                done();
            });
        });

        it('should keep the title if name is defined', function (done) {
            var title = 'no name?',
                files = {
                    'tracks/test1.md': {'title': title, 'gpx': 'noname.gpx'},
                    'tracks/noname.gpx': {contents: gpxFileContent('noname.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.equal(title, file.title);
                done();
            });
        });

        it('should keep the created property if time not defined', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'notime.gpx', 'created': '2014'},
                    'tracks/notime.gpx': {contents: gpxFileContent('notime.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.equal('2014', file.created);
                done();
            });
        });

        it('should not overwrite the created property', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'time.gpx', 'created': '2014'},
                    'tracks/time.gpx': {contents: gpxFileContent('test1.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.equal('2014', file.created);
                done();
            });
        });

        it('should detect whether the track is a loop', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'loop.gpx'},
                    'tracks/loop.gpx': {contents: gpxFileContent('loop.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.strictEqual(true, file.loop);
                done();
            });
        });

        it('should ignore points without elevation when detecting a loop', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'loop_noele.gpx'},
                    'tracks/loop_noele.gpx': {contents: gpxFileContent('loop_noele.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'];

                assert.ok(typeof err === 'undefined');

                assert.strictEqual(true, file.loop);
                done();
            });
        });
    });

    describe('points', function () {
        it('should provide the points with elevation', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'loop.gpx'},
                    'tracks/loop.gpx': {contents: gpxFileContent('loop.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    points = file.points;

                assert.ok(typeof err === 'undefined');
                assert.ok(Array.isArray(points));

                assert.equal(2, points.length);
                assert.equal(46.250508, points[0].lat);
                assert.equal(5.317694, points[0].lon);
                assert.equal(200.1, points[0].ele);

                assert.equal(46.2505, points[1].lat);
                assert.equal(5.3176, points[1].lon);
                assert.equal(240.2, points[1].ele);

                done();
            });
        });

        it('should ignore the points without elevation', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'loop_noele.gpx'},
                    'tracks/loop_noele.gpx': {contents: gpxFileContent('loop_noele.gpx')},
                };

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    points = file.points;

                assert.ok(typeof err === 'undefined');
                assert.ok(Array.isArray(points));

                assert.equal(2, points.length);
                assert.equal(46.250508, points[0].lat);
                assert.equal(5.317694, points[0].lon);
                assert.equal(200.1, points[0].ele);

                assert.equal(46.2505, points[1].lat);
                assert.equal(5.3176, points[1].lon);
                assert.equal(240.2, points[1].ele);

                done();
            });
        });

        it('should filter points based on the elevation', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'elevationminstep.gpx'},
                    'tracks/elevationminstep.gpx': {contents: gpxFileContent('elevationminstep.gpx')},
                },
                expectedElevations = [200, 205, 205, 208.2, 208.2];

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    points = file.points;

                assert.ok(typeof err === 'undefined');
                assert.ok(Array.isArray(points));

                assert.equal(expectedElevations.length, points.length);
                expectedElevations.forEach(function (ele, i) {
                    assert.equal(ele, points[i].ele);
                });

                done();
            });
        });

        it('should filter points based on the elevation (config)', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'elevationminstep.gpx'},
                    'tracks/elevationminstep.gpx': {contents: gpxFileContent('elevationminstep.gpx')},
                },
                expectedElevations = [200, 205, 205, 208.2, 210];

            gpx({elevationMinDiff: 1.5})(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    points = file.points;

                assert.ok(typeof err === 'undefined');
                assert.ok(Array.isArray(points));

                assert.equal(expectedElevations.length, points.length);
                expectedElevations.forEach(function (ele, i) {
                    assert.equal(ele, points[i].ele);
                });

                done();
            });
        });

        it('should filter points based on the elevation (local config)', function (done) {
            var files = {
                    'tracks/test1.md': {'gpx': 'elevationminstep.gpx', 'elevationMinDiff': 0.5},
                    'tracks/elevationminstep.gpx': {contents: gpxFileContent('elevationminstep.gpx')},
                },
                expectedElevations = [200, 205, 206, 208.2, 210];

            gpx()(files, ms, function (err) {
                var file = files['tracks/test1.md'],
                    points = file.points;

                assert.ok(typeof err === 'undefined');
                assert.ok(Array.isArray(points));

                assert.equal(expectedElevations.length, points.length);
                expectedElevations.forEach(function (ele, i) {
                    assert.equal(ele, points[i].ele);
                });

                done();
            });
        });

    });
});
