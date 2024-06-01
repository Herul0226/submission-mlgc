const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
  try {
    const imageFile = request.payload.image;
    if (imageFile.bytes > 1000000) {
      return h.response({
        status: 'fail',
        message: 'Payload content length greater than maximum allowed: 1000000'
      }).code(413);
    }

    const { image } = request.payload;
    const { model } = request.server.app;
    const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
    
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      "id": id,
      "result": label,
      "suggestion": suggestion,
      "createdAt": createdAt
    }

    await storeData(id, data);


    const response = {
      status: 'success',
      message: 'Model is predicted successfully',
      data: {
        id: id,
        result: label,
        suggestion: suggestion,
        createdAt: createdAt
      }
    };
    return h.response(response).code(201);
  } catch (error) {
    // Menangani kesalahan saat prediksi
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    }).code(400);
  }
}

module.exports = postPredictHandler;
