function doGet() {
    var html;
    try {
        html = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f9; }
                .loading-overlay {
                  position: fixed;
                  top: 0; left: 0; right: 0; bottom: 0;
                  background-color: rgba(255, 255, 255, 0.8);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 1000;
                  font-size: 1.5em;
                  color: #004AAD;
                }
                .search-container { margin: 20px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
                .search-input, .cd-selector, .line-selector, .search-button {
                  padding: 12px; font-size: 16px; border-radius: 25px; border: 1px solid #ddd; outline: none;
                }
                .search-input { width: 300px; }
                .cd-selector, .line-selector { min-width: 180px; }
                .search-button { background-color: #004AAD; color: white; border: none; cursor: pointer; }
                .search-button:hover { background-color: #003080; }
                .card-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 20px; }
                .card {
                  width: 23%; /* Ajuste para 4 cartas por linha */
                  border: 1px solid #ddd;
                  border-radius: 10px;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  padding: 16px;
                  text-align: center;
                  background-color: white;
                  transition: transform 0.2s, box-shadow 0.2s;
                }
                .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                }
                .card-title { color: #004AAD; font-weight: bold; font-size: 1.2em; margin-bottom: 5px; }
                .card-number { font-weight: bold; font-size: 1.1em; color: #333; margin-top: 5px; margin-bottom: 10px; }
                .card-line { font-size: 1em; color: #666; margin-bottom: 10px; }
                .card-link { text-decoration: none; color: #004AAD; font-weight: bold; }
                .card-link:hover { text-decoration: underline; color: #003080; }
                .pagination { margin: 20px; display: flex; gap: 10px; justify-content: center; align-items: center; }
                .pagination button {
                  padding: 10px 15px; font-size: 16px; background-color: #004AAD; color: white;
                  border: none; border-radius: 25px; cursor: pointer; transition: background-color 0.2s;
                }
                .pagination button:hover { background-color: #003080; }
                .pagination span { font-size: 16px; color: #333; }
              </style>
            </head>
            <body>
              <div class="loading-overlay" id="loadingOverlay">Aguarde, carregando dados...</div>
      
              <div class="search-container">
                <select id="cdSelector" class="cd-selector" onchange="populateLineOptions(); filterCards();">
                  <option value="">Selecione o CD</option>
                  ${generateCDOptions()}
                </select>
                <select id="lineSelector" class="line-selector" onchange="filterCards()">
                  <option value="">Selecione a Linha</option>
                </select>
                <input type="text" id="searchInput" class="search-input" placeholder="Buscar por unidade ou lote..." onkeyup="filterCards()" />
                <button onclick="filterCards()" class="search-button">🔍 Buscar</button>
              </div>
              
              <div id="cardsContainer" class="card-container"></div>
              <div class="pagination">
                <button onclick="firstPage()" id="firstButton">⏮ Primeira</button>
                <button onclick="prevPage()" id="prevButton">◀</button>
                <span id="pageInfo"></span>
                <button onclick="nextPage()" id="nextButton">▶</button>
                <button onclick="skipNextThreePages()" id="skipNextButton">⏭</button>
              </div>
              
              <script>
                var cardsData = ${JSON.stringify(generateCardsData())};
                var currentPage = 1;
                var itemsPerPage = 50; // Exibir 50 itens por página
                var pageIncrement = 3;
                var filteredCards = cardsData;

                document.addEventListener("DOMContentLoaded", function() {
                  displayCards();
                  document.getElementById("loadingOverlay").style.display = "none";
                });

                function populateLineOptions() {
                  var cd = document.getElementById('cdSelector').value;
                  var lineSelector = document.getElementById('lineSelector');
                  lineSelector.innerHTML = '<option value="">Selecione a Linha</option>';

                  var lines = Array.from(new Set(cardsData
                    .filter(card => cd === "" || card.title.startsWith(cd))
                    .map(card => card.line)))
                    .sort();

                  if (lines.length > 0) {
                      lines.forEach(line => {
                          var option = document.createElement("option");
                          option.value = line;
                          option.textContent = line;
                          lineSelector.appendChild(option);
                      });
                  } else {
                      lineSelector.innerHTML = '<option value="">Nenhuma linha disponível</option>';
                  }
                }

                function displayCards() {
                  var startIndex = (currentPage - 1) * itemsPerPage;
                  var endIndex = startIndex + itemsPerPage;
                  var cardsToDisplay = filteredCards.slice(startIndex, endIndex);

                  var cardsContainer = document.getElementById('cardsContainer');
                  cardsContainer.innerHTML = cardsToDisplay.map(card => card.html).join('');

                  document.getElementById('pageInfo').innerText = 'Página ' + currentPage + ' de ' + Math.ceil(filteredCards.length / itemsPerPage);

                  document.getElementById('prevButton').disabled = currentPage === 1;
                  document.getElementById('nextButton').disabled = currentPage >= Math.ceil(filteredCards.length / itemsPerPage);
                  document.getElementById('skipNextButton').disabled = currentPage + pageIncrement > Math.ceil(filteredCards.length / itemsPerPage);
                }

                function filterCards() {
                  var searchInput = document.getElementById('searchInput').value.toLowerCase();
                  var cd = document.getElementById('cdSelector').value.toLowerCase();
                  var line = document.getElementById('lineSelector').value;

                  filteredCards = cardsData.filter(function(card) {
                    var title = card.title.toLowerCase();
                    var cdMatch = cd === "" || title.startsWith(cd);
                    var lineMatch = line === "" || card.line === line;
                    var searchMatch = searchInput === "" || title.includes(searchInput);
                    return cdMatch && lineMatch && searchMatch;
                  });

                  currentPage = 1;
                  displayCards();
                }

                function firstPage() {
                  currentPage = 1;
                  displayCards();
                }

                function prevPage() {
                  if (currentPage > 1) {
                    currentPage--;
                    displayCards();
                  }
                }

                function nextPage() {
                  if (currentPage < Math.ceil(filteredCards.length / itemsPerPage)) {
                    currentPage++;
                    displayCards();
                  }
                }

                function skipNextThreePages() {
                  if (currentPage + pageIncrement <= Math.ceil(filteredCards.length / itemsPerPage)) {
                    currentPage += pageIncrement;
                  } else {
                    currentPage = Math.ceil(filteredCards.length / itemsPerPage);
                  }
                  displayCards();
                }
              </script>
            </body>
          </html>
        `;
    } catch (error) {
        Logger.log("Erro ao gerar HTML: " + error);
        html = `<html><body><p>Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p></body></html>`;
    }
    return HtmlService.createHtmlOutput(html).setWidth(1200).setHeight(800);
}

function generateCDOptions() {
    try {
        var cds = ["49", "93", "389", "299", "985", "1116", "893", "2099", "2599", "5299", "5599"];
        return cds.map(cd => `<option value="${cd}">${cd}</option>`).join("");
    } catch (error) {
        Logger.log("Erro ao gerar opções de CD: " + error);
        return "<option value=''>Erro ao carregar CDs</option>";
    }
}

function generateCardsData() {
    var sheetId = '1r9H9YryxpZBzncmXg3MJq5Zg0uHoXsuuwcxUot2ez8w';
    var sheetNames = ["49", "93", "389", "299", "985", "1116", "893", "2099", "2599", "5299", "5599"];
    var cardsData = [];

    try {
        var spreadsheet = SpreadsheetApp.openById(sheetId);

        sheetNames.forEach(function(sheetName) {
            var sheet = spreadsheet.getSheetByName(sheetName);
            if (!sheet) return;
            
            var data = sheet.getDataRange().getValues();

            for (var i = 1; i < data.length; i++) {
                var row = data[i];
                var loteName = row[0];
                var pdfUrl = row[2];
                var category = row[4];
                var line = row[3];

                var cardHtml = `
                  <div class="card" data-title="${loteName}" data-category="${category}">
                    <div class="card-title">Lote</div>
                    <div class="card-number">Nº ${loteName}</div>
                    <div class="card-line">Linha: ${line}</div>
                    <p><a href="${pdfUrl}" target="_blank" class="card-link">Link para PDF</a></p>
                  </div>`;

                cardsData.push({ title: loteName, html: cardHtml, category: category, line: line });
            }
        });
    } catch (error) {
        Logger.log("Erro ao acessar a planilha: " + error);
        return [];
    }

    return cardsData;
}
