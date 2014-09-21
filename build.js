#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2), {
        "string": ['destination', 'source', 'forecast'],
        "boolean": ['help', 'h'],
    }),
    source, destination,
    metalsmith = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    templates = require('metalsmith-templates'),
    permalinks = require('metalsmith-permalinks'),
    metadata = require('metalsmith-metadata'),
    collections = require('metalsmith-collections'),
    ignore = require('metalsmith-ignore'),
    fileMetadata = require('metalsmith-filemetadata'),
    include = require('metalsmith-include'),
    paginate = require('metalsmith-paginate'),
    assets = require('metalsmith-assets'),
    tags = require('metalsmith-tags'),
    buildDate = require('metalsmith-build-date'),

    date = require('./lib/metalsmith/date'),
    gpxcleaner = require('./lib/metalsmith/gpxcleaner'),
    gpxparser = require('./lib/metalsmith/gpxparser'),
    profile = require('./lib/metalsmith/profile'),
    paginateTag = require('./lib/metalsmith/paginate-tag.js'),
    forecast = require('./lib/metalsmith/forecast.js'),

    pjson = require('./package.json'),
    conf = require('./build.json'),
    forecastConf = conf.forecast;

if ( argv.help || argv.h ) {
    console.log('build.js [--source srcDir] [--destination destDir] [--forecast-key apiKey]');
    console.log('--source srcDir: override the source directory defined in build.json');
    console.log('--destination destDir: override the destination directory defined in build.json');
    console.log('--forecast apiKey: API for Forecast.io (if not provided, fake data are used)');
    process.exit(0);
}

console.log('Preparing the environment');
console.log(' - Configuring moment.js');
require('moment').locale(conf.lang);

console.log(' - Adding the custom Swig filters');
require('./lib/swig/filters')(require('swig'), conf);

source = conf.source;
destination = conf.destination;
if ( argv.source ) {
    source = argv.source;
}
if ( argv.destination ) {
    destination = argv.destination;
}
if ( argv.forecast ) {
    forecastConf.key = argv.forecast;
}

console.log();
console.log('Starting to build ' + pjson.name);
console.log('- Source: "' + __dirname + '/' + source + '"');
console.log('- Destination: "' + __dirname + '/' + destination + '"');
metalsmith(__dirname)
    .source(source)
    .use(tags(conf.tags))
    .use(forecast(forecastConf))
    .use(fileMetadata(conf.fileMetadata))
    .use(gpxcleaner(conf.gpxcleaner))
    .use(gpxparser())
    .use(profile(conf.profile))
    .use(markdown())
    .use(include())
    .use(collections(conf.collections))
    .use(paginate(conf.paginate))
    .use(paginateTag(conf.paginateTag))
    .use(permalinks({relative: false}))
    .use(metadata(conf.metadata))
    .use(date(conf.date))
    .use(buildDate())
    .use(templates(conf.templateEngine))
    .use(ignore(conf.ignore))
    .use(assets({
        source: conf.assets,
        destination: conf.assets
    }))
    .destination(destination)
    .build(function (error, res) {
        if ( error ) {
            console.error("Build failed: " + error.message);
            console.log(error.stack);
            process.exit(1);
        }
        console.log('Build successful in ' + destination + ', wrote:');
        Object.keys(res).forEach(function (key) {
            console.log('- ' + key);
        });
    });
