function atualizarValorLote() {
  // Definir a hora personalizada para mudar de 'GANHANDO' para 'VENCEDOR'
  var horaPersonalizada = 18; // Altere este valor para a hora que você deseja, por exemplo, 17 para 17h

  // Abrir a planilha e selecionar as abas necessárias
  var ss = SpreadsheetApp.openById('1XQ8mapYrNIvQ12jsQ7_QyqErQtrO7OIyIyMBeHAEE68'); // ID da sua planilha
  var formularioSheet = ss.getSheetByName('formulario'); // Aba 'formulario'
  var valorLoteSheet = ss.getSheetByName('valor lote'); // Aba 'valor lote'
  var vencidoSheet = ss.getSheetByName('vencido'); // Aba 'vencido'
  
  // Obter todos os dados da aba 'formulario' a partir da linha 2
  var data = formularioSheet.getRange(2, 1, formularioSheet.getLastRow() - 1, formularioSheet.getLastColumn()).getValues();

  // Criar um objeto para armazenar o maior lance de cada lote
  var lotes = {};
  var now = new Date();
  var horaAtual = now.getHours();

  // Iterar sobre os dados para encontrar o maior lance de cada lote
  for (var i = 0; i < data.length; i++) {
    var lote = data[i][4]; // Número do lote (coluna E)
    var lance = parseFloat(data[i][5]); // Valor do lance (coluna F)
    // Garantir que o lote seja tratado como string, incluindo lotes com letras
    lote = String(lote);

    // Se o lote ainda não estiver no objeto ou o lance for maior que o atual, atualizar
    if (!lotes[lote] || lance > lotes[lote].lance) {
      lotes[lote] = {
        linhaCompleta: data[i], // Linha completa dos dados
        lance: lance // Valor do lance (coluna F)
      };
    }
  }

  // Limpar a aba 'valor lote' antes de preencher
  valorLoteSheet.clear();

  // Inserir o cabeçalho na aba 'valor lote' (adicionando uma coluna "STATUS")
  valorLoteSheet.appendRow(['HORA', 'CNPJ', 'E-MAIL', 'TELEFONE', 'NUMERO DO LOTE', 'LANCE', 'STATUS']);

  // Travar a primeira linha e as colunas até a coluna G
  valorLoteSheet.setFrozenRows(1); // Trava a primeira linha (cabeçalho)
  valorLoteSheet.setFrozenColumns(7); // Trava as primeiras 7 colunas (A até G)

  // Formatar o cabeçalho (linha 1) com fundo azul claro, texto em negrito e bordas
  var headerRange = valorLoteSheet.getRange(1, 1, 1, valorLoteSheet.getLastColumn());
  headerRange.setBackground('#ADD8E6'); // Fundo azul claro
  headerRange.setFontWeight('bold'); // Texto em negrito
  headerRange.setHorizontalAlignment('center'); // Centraliza o cabeçalho
  headerRange.setBorder(true, true, true, true, true, true); // Adiciona borda

  // Verificar se já passou da hora personalizada
  var statusVencido = horaAtual >= horaPersonalizada ? true : false;

  // Preencher a aba 'valor lote' com os maiores lances, a partir da linha 2
  var linha = 2;
  for (var lote in lotes) {
    var info = lotes[lote].linhaCompleta;
    var observacao = statusVencido ? 'VENCEDOR' : 'GANHANDO';

    // Inserir a linha completa e adicionar o status
    valorLoteSheet.appendRow(info.concat([observacao]));

    // Aplicar cor alternada
    var range = valorLoteSheet.getRange(linha, 1, 1, valorLoteSheet.getLastColumn());
    range.setBackground(linha % 2 === 0 ? '#F9F9F9' : 'white'); // Alterna entre cinza claro e branco
    range.setHorizontalAlignment('center'); // Centraliza o conteúdo
    linha++;
  }

  // Formatação condicional para destacar "GANHANDO" em verde claro com texto verde escuro
  var colunaStatus = 7; // Coluna "STATUS"
  var regra = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('GANHANDO')
    .setBackground('#90EE90') // Verde claro
    .setFontColor('#006400') // Verde escuro para o texto
    .setRanges([valorLoteSheet.getRange(2, colunaStatus, valorLoteSheet.getLastRow() - 1, 1)])
    .build();
  var regras = valorLoteSheet.getConditionalFormatRules();
  regras.push(regra);
  valorLoteSheet.setConditionalFormatRules(regras);

  // Ajustar a largura das colunas automaticamente
  valorLoteSheet.autoResizeColumns(1, valorLoteSheet.getLastColumn());

  // Se for após a hora personalizada, mover os dados para a aba "vencido"
  if (statusVencido) {
    // Limpar a aba 'vencido' antes de preencher
    vencidoSheet.clear();

    // Inserir o cabeçalho na aba 'vencido'
    vencidoSheet.appendRow(['HORA', 'CNPJ', 'E-MAIL', 'TELEFONE', 'NUMERO DO LOTE', 'LANCE', 'STATUS']);

    // Mover os dados vencidos para a aba "vencido"
    var vencidoData = valorLoteSheet.getRange(2, 1, valorLoteSheet.getLastRow() - 1, valorLoteSheet.getLastColumn()).getValues();
    vencidoSheet.getRange(2, 1, vencidoData.length, vencidoData[0].length).setValues(vencidoData);

    // Formatação do cabeçalho da aba "vencido"
    var vencidoHeaderRange = vencidoSheet.getRange(1, 1, 1, vencidoSheet.getLastColumn());
    vencidoHeaderRange.setBackground('#ADD8E6');
    vencidoHeaderRange.setFontWeight('bold');
    vencidoHeaderRange.setHorizontalAlignment('center');
    vencidoHeaderRange.setBorder(true, true, true, true, true, true);

    // Ajuste automático da largura das colunas na aba 'vencido'
    vencidoSheet.autoResizeColumns(1, vencidoSheet.getLastColumn());
  }
}
