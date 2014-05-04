jQuery(function ($) {
  var util = {
    uuid: function(){
      /*jshint bitwise:false */
      var i, random;
      var uuid = '';

      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }

      return uuid;
    },
    store: function(ns, data){
      if(arguments.length > 1){
        return localStorage.setItem(ns, JSON.stringify(data));
      }
      else {
        return JSON.parse(localStorage.getItem(ns)) || [];
      }
    },
    format: function(data){
      var formattedData = [];
      var myObj = {};
//       $.each(data, function(i, value){
//         myObj[data[i]]
//         console.log("baller");
//       });
      for (var i = 0; i < data.length; i++){
        var p1;
        var p2;
        var gp = data[i].gp.name;
        var id = data[i].id;
        var p1total = parseInt(data[i].gp.race1.p1score,10) + 
            parseInt(data[i].gp.race2.p1score,10) + 
            parseInt(data[i].gp.race3.p1score,10) + 
            parseInt(data[i].gp.race4.p1score,10);
        var p2total = parseInt(data[i].gp.race1.p2score,10) + 
            parseInt(data[i].gp.race2.p2score,10) + 
            parseInt(data[i].gp.race3.p2score,10) + 
            parseInt(data[i].gp.race4.p2score,10);
        if (p1total > p2total){
          if (p1total === 36){
            p1 = 3;
            p2 = 0;
          } else{
            p1 = 2;
            p2 = 0; 
          }
        } else if (p1total < p2total){
          if (p2total === 36){
            p1 = 0;
            p2 = 3;
          } else{
            p1 = 0;
            p2 = 2; 
          }
        } else {
          p1 = 1;
          p2 = 1;
        }
        formattedData.push({
          id: id,
          gp: gp,
          p1score: p1, 
          p2score: p2
        });
      }
      return formattedData;
    }
  };

  var app = {
    init: function(){
      this.rawData = util.store("raw");
      this.cacheElements();
      this.bindEvents();
      this.render();
      console.log(this.rawData);
    },
    cacheElements: function(){
      this.gpTemplate = Handlebars.compile($("#gp-template").html());
      this.leaderboardTemplate = Handlebars.compile($("#leaderboard-template").html());
      this.$app = $("#app");
      this.$main = this.$app.find("#main");
      this.$gpList = this.$main.find("#gp-list");
      this.$leaderboard = this.$app.find("#leaderboard");
      this.$add = this.$main.find($(".add"));
      this.$delete = this.$main.find($(".delete"));
    },
    bindEvents: function(){
      this.$main.on("click", ".add", this.addRace.bind(this));
      this.$gpList.on("click", ".delete", this.deleteRace.bind(this));
    },
    processForm: function(form){
      var rawFormData = $("#"+form).serializeArray();
      var formData = {};
      $.each(rawFormData, function( i, value ) {
        formData[rawFormData[i].name] = rawFormData[i].value;
      });
      return {
        id: util.uuid(),
        gp: {
          name: formData.gp,
          race1: {p1score: formData.p1r1, p2score: formData.p2r1},
          race2: {p1score: formData.p1r2, p2score: formData.p2r2},
          race3: {p1score: formData.p1r3, p2score: formData.p2r3},
          race4: {p1score: formData.p1r4, p2score: formData.p2r4}
        }
      };
    },
    totals: function(data){
      var numWinsP1 = 0;
      var numWinsP2 = 0;
      var numTies = 0;
      var numBonusesP1 = 0;
      var numBonusesP2 = 0;
      $.each(data, function(i, value){
        var p1score = parseInt(data[i].gp.race1.p1score, 10) + 
                      parseInt(data[i].gp.race2.p1score, 10) +
                      parseInt(data[i].gp.race3.p1score, 10) +
                      parseInt(data[i].gp.race4.p1score, 10);
        var p2score = parseInt(data[i].gp.race1.p2score, 10) + 
                      parseInt(data[i].gp.race2.p2score, 10) +
                      parseInt(data[i].gp.race3.p2score, 10) +
                      parseInt(data[i].gp.race4.p2score, 10);
        if (p1score > p2score) {
          numWinsP1++;
          if (p1score === 36) {
            numBonusesP1++;
          }
        } 
        else if (p2score > p1score) {
          numWinsP2++;
          if (p2score === 36) {
            numBonusesP2++;
          }
        } 
        else { numTies++ }
      });
      return {
              p1: {wins: numWinsP1, bonuses: numBonusesP1},
              p2: {wins: numWinsP2, bonuses: numBonusesP2},
              ties: numTies
             };
    },
    addRace: function(e){
      e.preventDefault();
      this.$form = $(e.target).data("submit");
      this.gp = this.processForm(this.$form);
      this.rawData.push(this.gp);
      this.render();
    },
    deleteRace: function(e){
      this.$id = $(e.target).data("id");
      this.index = this.indexOfId(this.$id, this.rawData);
      this.rawData.splice(this.index, 1);
      this.render();
    },
    render: function(){
      var GPs = util.format(this.rawData);
      var leaderboard = this.totals(this.rawData);
      this.$gpList.html(this.gpTemplate(GPs));
      this.$leaderboard.html(this.leaderboardTemplate(leaderboard));
      util.store("raw", this.rawData);
    },
    indexOfId: function(id, arr){
      var len = arr.length;
      for (var i = 0; i < len; i++){
        if (arr[i].id === id){
          return i;
        }
      }
    }
  };

  app.init();
  
});