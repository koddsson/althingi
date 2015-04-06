var request = require('request');
var cheerio = require('cheerio');
var entities = require('entities');

module.exports.votes = function(id, callback) {
  var options = {
    url: 'https://althingi.is/altext/cv/is/atkvaedaskra/?nfaerslunr=' + id,
    headers: {
      'User-Agent': 'Scraper!'
    }
  };
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
    }
    var $ = cheerio.load(body);
    var data = $('table').first().find('tbody tr').map(function(_, element) {
      return {
        datetime: $(element).find('td').eq(0).text(),
        name: $(element).find('td').eq(1).text(),
        url: 'https://althingi.is' + $(element).find('td a').attr('href'),
        vote: $(element).find('td').eq(2).text(),
      };
    }).filter(function(_, element) {
      return element.datetime !== '';
    }).toArray();
    callback(null, data);
  });
};

module.exports.list = function(callback) {
  var options = {
    url: 'https://althingi.is/thingmenn/althingismenn/',
    headers: {
      'User-Agent': 'Scraper!'
    }
  };
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
    }

    var $ = cheerio.load(body);
    var data = $('tbody tr').map(function(_, element) {
      var url = $(element)
        .find('td span a')
        .attr('href');
      return {
        name: $(element)
          .find('td span a')
          .eq('0')
          .text()
          .replace(/[\u00AD\u002D\u2011]+/g, '')
          .trim(),
        title: entities.decodeHTML($(element)
          .find('td')
          .eq('0')
          .html()
          .split('<br>')[1])
          .replace(/[\u00AD\u002D\u2011]+/g, ''),
        party: $(element)
          .find('td')
          .eq(3)
          .text()
          .replace(/[\u00AD\u002D\u2011]+/g, ''),
        constituency: $(element)
          .find('td')
          .eq(1)
          .text()
          .split('.')[0],
        id: url.split('=')[1],
        url: 'https://althingi.is' + url,
      };
    }).toArray();

    callback(null, data);
  });
};
