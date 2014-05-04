jQuery(function ($) {
  var util = {
    uuid: function(){
      //generate a unique ID
      var i = 0;
      return function(){
        return i++;
      };
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
//       var myObj = {};
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
        console.log(p1total);
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
//     totals: function(data){
//       console.log(data);
//       var p1wins = 0;
//       var p2wins = 0;
//       var numties = 0;
//       for (var i = 0; i < data.length; i++){
//         if(data[i].p1score !== 0 && data[i].p1score !== "1"){
//           p1wins++;
//         }else if (data[i].p1score !== "1"){
//           p2wins++;
//         }else{ numties++; }
//       }
//       return {
//               p1: {wins: p1wins, bonus: 10},
//               p2: {wins: p2wins, bonus: 9},
//               ties: numties
//              };
//     }
  };

  var app = {
    init: function(){
      this.rawData = util.store("raw");
//       this.Totals = util.totals();
      this.cacheElements();
      this.bindEvents();
      this.render();
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
      this.$gpList.html(this.gpTemplate(util.format(this.rawData)));
//       this.$leaderboard.html(this.leaderboardTemplate(this.Totals));
      util.store("raw", this.rawData);
//       util.totals(this.GPs);
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