function doPost(e) {
  try {
    // Definir a hora limite como 15:00
    var horaLimite = new Date(); 
    horaLimite.setHours(10, 0, 0, 0); // Define o horário limite para 15:00 horas no fuso horário local

    // Obter a hora atual
    var agora = new Date(); // Pega a hora atual

    Logger.log("Hora atual: " + agora);  // Log para checagem
    Logger.log("Hora limite: " + horaLimite);  // Log para checagem

    // Verificar se o lance foi enviado após a hora limite
    if (agora > horaLimite) {
      Logger.log("Prazo expirado.");
      return ContentService.createTextOutput("Infelizmente, o prazo para envio de lances encerrou às 15:00. Agradecemos seu interesse.");
    }

    // Verificar se os parâmetros estão recebidos corretamente
    var cnpj = e.parameter.cnpj;
    var email = e.parameter.email;
    var telefone = e.parameter.telefone;
    var lote = e.parameter.lote;
    var lance = parseFloat(e.parameter.lance); // Convertendo o lance para número

    if (!cnpj || !email || !telefone || !lote || isNaN(lance)) {
      Logger.log("Parâmetros faltando ou inválidos. CNPJ: " + cnpj + ", Email: " + email + ", Telefone: " + telefone + ", Lote: " + lote + ", Lance: " + lance);
      throw new Error("Parâmetros inválidos ou faltantes.");
    }

    // Validar se o lance é maior ou igual ao valor do lote na aba 'valor lote'
    var valorLoteSheet = SpreadsheetApp.openById('1cNpEBGt-2oyXGH6Cx1KQ-buOlQ3veD1YoZDl5K2OhpQ').getSheetByName('valor lote');
    var valorLoteData = valorLoteSheet.getDataRange().getValues();
    
    var valorMinimoLote = null;
    for (var i = 1; i < valorLoteData.length; i++) {
      if (valorLoteData[i][0] == lote) { // Supondo que o número do lote esteja na primeira coluna
        valorMinimoLote = parseFloat(valorLoteData[i][1]); // Supondo que o valor do lote esteja na segunda coluna
        break;
      }
    }
    
    if (valorMinimoLote === null) {
      Logger.log("Lote não encontrado: " + lote);
      throw new Error("Lote não encontrado na aba 'valor lote'.");
    }

    if (lance < valorMinimoLote) {
      Logger.log("Lance de " + lance + " é menor que o valor mínimo de " + valorMinimoLote);
      return ContentService.createTextOutput("Erro: O lance de " + lance + " é menor que o valor mínimo permitido para o lote " + lote + " de " + valorMinimoLote + ".");
    }

    // Prosseguir com a lógica de salvar o lance na aba 'formulario'
    var formSheet = SpreadsheetApp.openById('1cNpEBGt-2oyXGH6Cx1KQ-buOlQ3veD1YoZDl5K2OhpQ').getSheetByName('formulario');
    formSheet.appendRow([new Date(), cnpj, email, telefone, lote, lance]);
    Logger.log("Lance salvo: Lote " + lote + ", Lance: " + lance);

    // Retornar uma resposta confirmando o recebimento do lance
    return ContentService.createTextOutput("Lance recebido com sucesso! Lote: " + lote + ", Lance: " + lance + ", CNPJ: " + cnpj + ", Email: " + email + ", Telefone: " + telefone);

  } catch (error) {
    Logger.log("Erro ao processar o lance: " + error.message);
    // Se houver erro, retornar uma mensagem de erro
    return ContentService.createTextOutput("Erro ao processar o lance: " + error.message);
  }
}
