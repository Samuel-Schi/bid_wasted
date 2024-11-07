function listFilesFromSubfoldersByLot() {
  var folderId = '1Jg9Rtgk2ODeyt2qF_9KkFUYqQ8_Q-qGz'; // Substitua pelo ID da sua pasta "matrix"
  var folder = DriveApp.getFolderById(folderId); // Acessa a pasta pelo ID
  var subfolders = folder.getFolders(); // Obtém todas as subpastas dentro da pasta principal
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Função para aplicar o layout padrão em uma aba
  function applyLayout(sheet) {
    sheet.getRange('A1:C1').setValues([['Nº LOTE', 'Imagem', 'Link para PDF']]);
    sheet.getRange('A1:C1').setFontWeight('bold').setFontSize(12).setBackground('#ADD8E6').setHorizontalAlignment('center');
    sheet.getRange('A1:C1').setFontColor('white');
    sheet.getRange('A1:C1').setBackground('#1E90FF'); // Cabeçalho azul escuro
    sheet.setColumnWidths(1, 3, 200); // Ajusta largura das colunas A a C para 200 pixels
    sheet.setColumnWidth(2, 300); // Coluna da imagem um pouco maior
  }

  // Loop pelas subpastas
  while (subfolders.hasNext()) {
    var subfolder = subfolders.next();
    var subfolderName = subfolder.getName();
    
    // Extrair o número do lote do nome da subpasta (apenas os dígitos iniciais)
    var loteNumber = subfolderName.match(/^\d+/);
    if (!loteNumber) continue; // Se não houver número no início, pula para a próxima subpasta
    
    loteNumber = loteNumber[0]; // Captura apenas o número

    // Verificar se já existe uma aba para o lote; caso contrário, cria e aplica o layout
    var sheet = ss.getSheetByName(loteNumber);
    if (!sheet) {
      sheet = ss.insertSheet(loteNumber);
      applyLayout(sheet); // Aplica o layout na nova aba criada
    }
    
    var files = subfolder.getFiles();
    var row = sheet.getLastRow() + 1;
    var imageUrl = '';
    var pdfUrl = '';
    var dataInserted = false;

    // Processa os arquivos dentro da subpasta
    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      var fileType = file.getMimeType();

      // Armazena a imagem ou o PDF, mas espera ter ambos antes de inserir na planilha
      if (fileType.startsWith('image/') && imageUrl === '') {
        imageUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
      }

      if (fileType === 'application/pdf' && pdfUrl === '') {
        pdfUrl = "https://drive.google.com/file/d/" + fileId + "/view";
      }

      // Insere na planilha apenas quando ambos, imagem e PDF, forem encontrados
      if (imageUrl && pdfUrl) {
        sheet.getRange(row, 1).setValue(subfolderName).setFontWeight('bold');
        sheet.getRange(row, 2).setFormula('=IMAGE("' + imageUrl + '")');
        sheet.getRange(row, 3).setValue(pdfUrl);

        // Limpa as variáveis para a próxima linha e incrementa a linha
        row++;
        imageUrl = '';
        pdfUrl = '';
        dataInserted = true;
      }
    }

    // Se apenas uma imagem ou PDF foi encontrado, insere mesmo assim
    if (!dataInserted && (imageUrl || pdfUrl)) {
      sheet.getRange(row, 1).setValue(subfolderName).setFontWeight('bold');
      if (imageUrl) {
        sheet.getRange(row, 2).setFormula('=IMAGE("' + imageUrl + '")');
      }
      if (pdfUrl) {
        sheet.getRange(row, 3).setValue(pdfUrl);
      }
    }

    // Estilizar a linha de dados
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) { // Apenas aplica estilo se houver dados
      sheet.getRange(2, 1, lastRow - 1, 3).setVerticalAlignment('middle');
      sheet.getRange(2, 1, lastRow - 1, 3).setBorder(true, true, true, true, true, true);
      sheet.getRange(2, 1, lastRow - 1, 3).setBackground('#F0F8FF');

      // Alternar cor das linhas para dar efeito "zebrado"
      for (var i = 2; i <= lastRow; i++) {
        if (i % 2 === 0) {
          sheet.getRange(i, 1, 1, 3).setBackground('#E6E6FA'); // Lilás claro para linhas pares
        } else {
          sheet.getRange(i, 1, 1, 3).setBackground('#F0F8FF'); // Azul claro para linhas ímpares
        }
      }
    }
  }
  
  SpreadsheetApp.flush(); // Garante que todas as mudanças sejam aplicadas
}
