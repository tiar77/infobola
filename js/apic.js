

// Blok kode yang akan di panggil jika fetch berhasil
function status(response) {
  if (response.status !== 200) {
    console.log("Error : " + response.status);
    // Method reject() akan membuat blok catch terpanggil
    return Promise.reject(new Error(response.statusText));
  } else {
    // Mengubah suatu objek menjadi Promise agar bisa "di-then-kan"
    return Promise.resolve(response);
  }
}
// Blok kode untuk memparsing json menjadi array JavaScript
function json(response) {
  return response.json();
}
// Blok kode untuk meng-handle kesalahan di blok catch
function error(error) {
  // Parameter error berasal dari Promise.reject()
  console.log("Error : " + error);
}


//=========================================
// Blok Kode Database
// ========================================

var dbPromise = idb.open("dbsepakbola", 1, function(upgradeDb) {
  if (!upgradeDb.objectStoreNames.contains("tim")) {
    upgradeDb.createObjectStore('tim', {keyPath: 'id', autoIncrement: false });
  }
  if (!upgradeDb.objectStoreNames.contains("jadwal")) {
    upgradeDb.createObjectStore('jadwal', {keyPath: 'id', autoIncrement: false });
  }
});

function addTim(vtim, vid) {
    console.log(dbPromise);
    dbPromise.then(function(db) {
        var tx = db.transaction('tim', 'readwrite');
        var store = tx.objectStore('tim');
        var item = {
            nama: vtim,
            id: vid,
            created: new Date().getTime()
        };
        console.log(item);
        store.put(item);
        return tx.complete;
    }).then(function() {
        console.log('Tim berhasil disimpan.');
        document.getElementById('add'+vid).innerHTML = `<i class="material-icons">check</i>`;
    }).catch(function() {
        console.log('Tim gagal disimpan.')
    })
}

function delTim(vid) {
  dbPromise.then(function(db) {
    var tx = db.transaction('tim', 'readwrite');
    var store = tx.objectStore('tim');
    store.delete(vid);
    return tx.complete;
    }).then(function() {
        document.getElementById('del'+vid).innerHTML = `terhapus`;
        console.log('Data tim favorit telah dihapus');
    });
}

function addJadwal(data) {
    dbPromise.then(function(db) {
        var tx = db.transaction('jadwal', 'readwrite');
        var store = tx.objectStore('jadwal');
        var items = data.split(",");
        item = {
          id: items[0],
          kompetisi: items[1],
          jadwal: items[2],
          Pertandingan: items[3],
          created: new Date().getTime()
        };
        store.put(item);
        document.getElementById('j'+items[0]).innerHTML = `<i class="material-icons">check</i>`;
        return tx.complete;

    }).then(function() {
        console.log('Jadwal berhasil disimpan.');

    }).catch(function() {
        console.log('Jadwal gagal disimpan.')
    })
}

function delJadwal(vid) {
  dbPromise.then(function(db) {
    var tx = db.transaction('jadwal', 'readwrite');
    var store = tx.objectStore('jadwal');
    store.delete(vid);
    document.getElementById('j'+vid).innerHTML = `terhapus`;
    return tx.complete;
    }).then(function() {

        console.log('Data jadwal favorit telah dihapus');
    });
}

function showTim (){
  var i = 0;
  var konten = "";
  konten += `<table class="striped">
             <thead><tr><th>No</th><th>Nama Tim / Club</th><th></th></tr>
             </thead><tbody>`;
  dbPromise.then(function(db) {
  var tx = db.transaction('tim', 'readonly');
  var store = tx.objectStore('tim');
  return store.getAll();
}).then(function(items) {
  console.log('Data yang diambil: ');
  console.log(items);
  items.forEach(function(data) {
      i++;
      konten += `<tr><td>${i}</td><td>${data.nama}</td><td><span id="del${data.id}"><a onClick="delTim('${data.id}'); return false;" title="Hapus Favorit" class="btn-floating btn-small waves-effect waves-light red"><i class="material-icons">delete</i></a></span></td></tr>`;
  });
  if (i==0) konten += `<tr><td colspan=3>Tidak ditemukan</td></tr>`;
  konten += `</tbody></table>`;
  document.getElementById("tim-content").innerHTML = konten;
})
    document.getElementById("logo-container").innerHTML = "Tim dan Jadwal Favorit";
}

function showJadwal (){
  var i = 0;
  var konten = "";
  konten += `<table class="striped">
             <thead><tr><th>No</th><th>Liga</th><th>Jadwal</th><th>Pertandingan</th><th></th></tr>
             </thead><tbody>`;
  dbPromise.then(function(db) {
  var tx = db.transaction('jadwal', 'readonly');
  var store = tx.objectStore('jadwal');
  return store.getAll();
}).then(function(items) {
  console.log('Data yang diambil: ');
  console.log(items);
  items.forEach(function(data) {
      i++;
      konten += `<tr><td>${i}</td><td>${data.kompetisi}</td><td>${data.jadwal}</td><td>${data.Pertandingan}</td>
      <td><span id="j${data.id}"><a onClick="delJadwal('${data.id}'); return false;" title="Hapus Favorit" class="btn-floating btn-tiny waves-effect waves-light red"><i class="tiny material-icons">delete</i></a></span></td></tr>`;
  });
  if (i==0) konten += `<tr><td colspan=3>Tidak ditemukan</td></tr>`;
  konten += `</tbody></table>`;
  document.getElementById("jadwal-content").innerHTML = konten;
})
    document.getElementById("logo-container").innerHTML = "Tim dan Jadwal Favorit";

}

// =====================================================================
//                 Loading Data
// =====================================================================

// Blok kode untuk melakukan request data "json
function getStandings(page) {
  var base_urls = "https://api.football-data.org/v2/competitions/2001/standings";
  var standingsHTML = "";
  var teamsHTML = `<table class="striped">
      <thead>
        <tr>
            <th>No</th>
            <th>Nama Tim / Club</th>
        </tr>
      </thead>
      <tbody>`;
  var matchesHTML = teamsHTML;
  if ('caches' in window) {
    caches.match(base_urls).then(function(response) {
      if (response) {
        console.log("cache");
        response.json().then(function (data) {

          var i = 0;
          var liga = data.competition.name;
          document.getElementById("logo-container").innerHTML = liga;
          console.log(data);
          //standingsHTML += `<h4>Klasemen</h4>`;
          data.standings.forEach(function(groups) {
            if (groups.type=="TOTAL"){
              standingsHTML += `<h5>${groups.group}</h5>`;
              standingsHTML += `<table class="striped">
                  <thead>
                    <tr>
                        <th>Posisi</th>
                        <th>Nama Tim / Club</th>
                        <th>Poin</th>
                    </tr>
                  </thead>
                  <tbody>`;
              groups.table.forEach(function(teams){
                i++;
                standingsHTML += `<tr><td>${teams.position}</td><td>${teams.team.name}</td><td>${teams.points}</td></tr>`;
                teamsHTML += `<tr><td>${i}</td><td><a href="tim.html?id=${teams.team.id}">${teams.team.name}</a></td></tr>`;
                matchesHTML += `<tr><td>${i}</td><td><a href="jadwal.html?id=${teams.team.id}">${teams.team.name}</a></td></tr>`;

              });
              standingsHTML += `</tbody></table>`;
            }
          })
        });
        teamsHTML += `</tbody></table>`;
        matchesHTML += `</tbody></table>`;
          // Sisipkan komponen card ke dalam elemen dengan id #content

          switch(page) {
            case "tim":
            konten = "<h4>Informasi Tim</h4>"+teamsHTML;
            break;
          case "jadwal":
            konten = "<h4>Jadwal Pertandingan</h4>"+matchesHTML;
            break;
          case "klasemen":
            konten = "<h4>Klasemen</h4>"+standingsHTML;
            break;
          case "favorit":
            showTim();
            showJadwal();
          }
        }
      })
    }

  fetch(base_urls, {headers: {'X-Auth-Token': '3ed8ced11a324ed493f3b5928c61199d'}})
  .then(status)
  .then(json)
  .then(function(data) {
    // Objek/array JavaScript dari response.json() masuk lewat data.
    // Menyusun komponen card artikel secara dinamis
    //console.log(data);
    var standingsHTML = ``;
    var teamsHTML = `<table class="striped">
        <thead>
          <tr>
              <th>Posisi</th>
              <th>Nama Tim / Club</th>
          </tr>
        </thead>
        <tbody>`;
    var matchesHTML = teamsHTML;
    var i = 0;
    var liga = data.competition.name;
    //standingsHTML += `<h4>Klasemen</h4>`;
    data.standings.forEach(function(groups) {
      if (groups.type=="TOTAL"){
        standingsHTML += `<h5>${groups.group}</h5>`;
        standingsHTML += `<table class="striped">
            <thead>
              <tr>
                  <th>No</th>
                  <th>Nama Tim / Club</th>
                  <th>Poin</th>
              </tr>
            </thead>
            <tbody>`;
        groups.table.forEach(function(teams){
          i++;
          standingsHTML += `<tr><td>${teams.position}</td><td>${teams.team.name}</td><td>${teams.points}</td></tr>`;
          teamsHTML += `<tr><td>${i}</td><td><a href="tim.html?id=${teams.team.id}">${teams.team.name}</a></td></tr>`;
          matchesHTML += `<tr><td>${i}</td><td><a href="jadwal.html?id=${teams.team.id}">${teams.team.name}</a></td></tr>`;
        });
        standingsHTML += `</tbody></table>`;
      }
    });

    teamsHTML += `</tbody></table>`;
    matchesHTML += `</tbody></table>`;
    // Sisipkan komponen card ke dalam elemen dengan id #content
    document.getElementById("logo-container").innerHTML = liga;
    switch(page) {
      case "tim":
        konten = teamsHTML;
        break;
      case "jadwal":
        konten = matchesHTML;
        break;
      case "klasemen":
        konten = standingsHTML;
        break;
      case "favorit":
      showTim();
      showJadwal();
      return;
    }
    document.getElementById("konten").innerHTML = konten;
  })
  .catch(error);

}

// ==================================================================
//                        Team By ID
// ===================================================================

function getTeamsByID(page) {
  var base_urls = "https://api.football-data.org/v2/teams/";

  var urlParams = new URLSearchParams(window.location.search);
  var idParam = urlParams.get("id");

//alert(window.location.href);
  if ('caches' in window) {
    caches.match(base_urls+idParam).then(function(response) {
      if (response) {
        console.log("cache");
        response.json().then(function (data) {

          console.log(data);
          //standingsHTML += `<h4>Klasemen</h4>`;
          var articleHTML = `</a>
          <div class="col s12 m7">
            <h4 class="header">${data.name} <span id="add${data.id}"><a onClick="addTim('${data.name}','${data.id}'); return false;" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">save</i></a></span></h4>
            <div class="card horizontal">
              <div class="card-image">
                <img src="${data.crestUrl}">
              </div>
              <div class="card-stacked">
                <div class="card-content">
                <p> Negara Asal: ${data.area.name}<br>
                    Stadium    : ${data.venue}<br>
                    Alamat     : ${data.address}<br>
                    Warna Club : ${data.clubColors}<br>
                    Website    : ${data.website}<br>
                    Email      : ${data.email}<br>
                    Telepon    : ${data.phone}<br>
                    Berdiri    : ${data.founded}<br>
                    Pemain     : <br>`;
                    data.squad.forEach(function(player) {
                      i++;
                      articleHTML += `${i}. ${player.name} (${player.position})<br>`;
                    });
                articleHTML += `</p>
                </div>
              </div>
            </div>
          </div>
          `;
          });
          // Sisipkan komponen card ke dalam elemen dengan id #content
          document.getElementById("body-content").innerHTML = articleHTML;

      }
    })
  }
  fetch(base_urls+idParam, {headers: {'X-Auth-Token': '3ed8ced11a324ed493f3b5928c61199d'}})
  .then(status)
  .then(json)
  .then(function(data) {
    // Objek/array JavaScript dari response.json() masuk lewat data.
    // Menyusun komponen card artikel secara dinamis
    console.log(data);
    var i = 0;
    var articleHTML = `
    <div class="col s12 m7">
      <h4 class="header">${data.name} <span id="add${data.id}"><a onClick="addTim('${data.name}','${data.id}'); return false;" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">save</i></a></span></h4>

      <div class="card horizontal">
        <div class="card-image small">
          <img src="${data.crestUrl}">
        </div>
        <div class="card-stacked">
          <div class="card-content">
            <p></p>
            <p> Negara Asal: ${data.area.name}<br>
                Stadium    : ${data.venue}<br>
                Alamat     : ${data.address}<br>
                Warna Club : ${data.clubColors}<br>
                Website    : ${data.website}<br>
                Email      : ${data.email}<br>
                Telepon    : ${data.phone}<br>
                Berdiri    : ${data.founded}<br>
                Pemain     : <br>`;
                data.squad.forEach(function(player) {
                  i++;
                  articleHTML += `${i}. ${player.name} (${player.position})<br>`;
                });
            articleHTML += `</p>
          </div>
        </div>
      </div>
    </div>
    `;

    document.getElementById("body-content").innerHTML = articleHTML;
  })
  .catch(error);

}

// ==================================================================
//                        Jadwal By ID
// ===================================================================

function getMatchesByID(page) {
  var base_urls = "https://api.football-data.org/v2/teams/";

  var urlParams = new URLSearchParams(window.location.search);
  var idParam = urlParams.get("id");

//alert(window.location.href);
  if ('caches' in window) {
    caches.match(base_urls+idParam+"/matches?status=SCHEDULED").then(function(response) {
      if (response) {
        console.log("cache");
        response.json().then(function (data) {

          console.log(data);

          var articleHTML = `<table class="striped">
              <thead>
                <tr>
                    <th>No</th>
                    <th>Liga</th>
                    <th>Jadwal</th>
                    <th>Pertandingan</th>
                    <th></th>
                </tr>
              </thead>
              <tbody>`;
                data.matches.forEach(function(jadwal) {
                  articleHTML += `<tr><td>${i}</td><td>${jadwal.competition.name}</td>
                    <td>${jadwal.utcDate}</td><td>${jadwal.homeTeam.name} Vs ${jadwal.awayTeam.name}</td>
                    <td><span id="j${data.id}"><a onClick="addJadwal('${jadwal}'); return false;" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">save</i></a></span></td>
                    </tr>`;
                });
              articleHTML += `</tbody>
            </table>`;
          // Sisipkan komponen card ke dalam elemen dengan id #content
          document.getElementById("body-content").innerHTML = articleHTML;
        })
      }
    })
  }

  fetch(base_urls+idParam+"/matches?status=SCHEDULED", {headers: {'X-Auth-Token': '3ed8ced11a324ed493f3b5928c61199d'}})
  .then(status)
  .then(json)
  .then(function(data) {
    // Objek/array JavaScript dari response.json() masuk lewat data.
    // Menyusun komponen card artikel secara dinamis
    console.log(data);
    var i = 0;
    standingsHTML = `<h4>Klasemen</h4>`;
    var articleHTML = `<table class="striped">
        <thead>
          <tr>
              <th>No</th>
              <th>Liga</th>
              <th>Jadwal</th>
              <th>Pertandingan</th>
              <th></th>
          </tr>
        </thead>
        <tbody>`;
            data.matches.forEach(function(jadwal) {
              i++;
              //console.log(jadwal);
              var item = [jadwal.id, jadwal.competition.name, jadwal.utcDate, jadwal.homeTeam.name+" Vs "+jadwal.awayTeam.name]
              articleHTML += `<tr><td>${i}</td><td>${jadwal.competition.name}</td>
                <td>${jadwal.utcDate}</td><td>${jadwal.homeTeam.name} Vs ${jadwal.awayTeam.name}</td>
                <td><span id="j${jadwal.id}"><a onClick="addJadwal('${item}'); return false;" class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">save</i></a></span></td>
                </tr>`;
            });
        articleHTML += `</tbody>
      </table>
    `;

    document.getElementById("body-content").innerHTML = articleHTML;
  })
  .catch(error);

}
