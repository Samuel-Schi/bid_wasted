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
                .value-slider-container { display: flex; align-items: center; gap: 10px; margin-top: 10px; justify-content: center; }
                .value-label { font-weight: bold; color: #333; }
                .value-slider { width: 200px; }
                .search-button { background-color: #004AAD; color: white; border: none; cursor: pointer; }
                .search-button:hover { background-color: #003080; }
                .card-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 20px; }
                .card {
                  flex-basis: 22%; /* Define largura para caber 4 cards por linha */
                  max-width: 250px;
                  box-sizing: border-box; /* Inclui padding e border na largura total */
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
                .card-number { font-weight: bold; color: #333; font-size: 1.1em; margin-top: 5px; margin-bottom: 10px; }
                .card-line { font-size: 1em; color: #666; margin-bottom: 10px; }
                .card-value { font-weight: bold; color: red; font-size: 1.1em; margin-bottom: 10px; }
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
                <select id="cdSelector" class="cd-selector" onchange="filterCards();">
                  <option value="">Selecione o DQS</option>
                  <option value="49">49</option>
                  <option value="93">93</option>
                  <option value="299">299</option>
                  <option value="389">389</option>
                  <option value="893">893</option>
                  <option value="985">985</option>
                  <option value="1116">1116</option>
                  <option value="2099">2099</option>
                  <option value="2599">2599</option>
                  <option value="2999">2999</option>
                  <option value="5299">5299</option>
                  <option value="5599">5599</option>
                </select>
                <select id="lineSelector" class="line-selector" onchange="filterCards()">
                  <option value="">Selecione a Linha</option>
                  ${generateLineOptions()}
                </select>
                <input type="text" id="searchInput" class="search-input" placeholder="Buscar por unidade ou lote..." onkeyup="filterCards()" />
                <button onclick="filterCards()" class="search-button">🔍 Buscar</button>
              </div>
              
              <div class="value-slider-container">
                <label class="value-label">Valor máximo: R$<span id="maxValueLabel">1000</span></label>
                <input type="range" id="maxValueSlider" class="value-slider" min="0" max="50000" step="50" value="50000" onchange="updateMaxLabel(); filterCards()" />
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
                var itemsPerPage = 50;
                var pageIncrement = 3;
                var filteredCards = cardsData;

                document.addEventListener("DOMContentLoaded", function() {
                  displayCards();
                  document.getElementById("loadingOverlay").style.display = "none";
                });

                function updateMaxLabel() {
                  document.getElementById("maxValueLabel").innerText = document.getElementById("maxValueSlider").value;
                }

                function filterCards() {
                  var searchInput = document.getElementById('searchInput').value.toLowerCase();
                  var dqs = document.getElementById('cdSelector').value;
                  var line = document.getElementById('lineSelector').value;
                  var maxValue = parseFloat(document.getElementById('maxValueSlider').value);

                  filteredCards = cardsData.filter(function(card) {
                    var title = card.title.toLowerCase();
                    var dqsMatch = dqs === "" || card.title.startsWith(dqs);
                    var lineMatch = line === "" || card.line === line;
                    var searchMatch = searchInput === "" || title.includes(searchInput);
                    var valueMatch = card.value <= maxValue;
                    return dqsMatch && lineMatch && searchMatch && valueMatch;
                  });

                  currentPage = 1;
                  displayCards();
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

function generateLineOptions() {
    try {
        var lineSet = new Set();
        var cardsData = generateCardsData();

        cardsData.forEach(card => {
            lineSet.add(card.line);
        });

        return Array.from(lineSet).sort().map(line => `<option value="${line}">${line}</option>`).join("");
    } catch (error) {
        Logger.log("Erro ao gerar opções de Linha: " + error);
        return "<option value=''>Erro ao carregar Linhas</option>";
    }
}

function generateCardsData() {
    var sheetId = '1r9H9YryxpZBzncmXg3MJq5Zg0uHoXsuuwcxUot2ez8w';
    var sheetName = "Lotes";
    var cardsData = [];

    try {
        var spreadsheet = SpreadsheetApp.openById(sheetId);
        var sheet = spreadsheet.getSheetByName(sheetName);
        if (!sheet) return [];

        var data = sheet.getDataRange().getValues();

        for (var i = 1; i < data.length; i++) {
            var row = data[i];
            var loteName = row[0];
            var pdfUrl = row[2];
            var category = row[4];
            var line = row[3];

            var valueString = row[4].toString().replace(/[R$\.,]/g, ''); // Remove "R$", "," e "."
            var value = parseFloat(valueString) || 0;

            var formattedValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            var cardHtml = `
              <div class="card" data-title="${loteName}" data-category="${category}">
                <div class="card-title">Lote</div>
                <div class="card-number">Nº ${loteName}</div>
                <div class="card-line">Linha: ${line}</div>
                <div class="card-value">Valor Inicial: ${formattedValue}</div>
                <p><a href="${pdfUrl}" target="_blank" class="card-link">Link para o Lote</a></p>
              </div>`;

            cardsData.push({ title: loteName, html: cardHtml, category: category, line: line, value: value });
        }
    } catch (error) {
        Logger.log("Erro ao acessar a planilha: " + error);
        return [];
    }

    return cardsData;
}
