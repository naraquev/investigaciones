#imports
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify

import pandas as pd
import numpy as np
# import os 

from keras.layers import Input, Dropout, Dense, Flatten, Activation, LSTM, Bidirectional, Concatenate
from keras.models import Model
from keras import backend as K

# Para almacenar y obtener el modelo para predicciones futuras de un archivo .pkl.
from sklearn.externals import joblib

import os.path

import sys

from adaptx import adaptX, adaptX_test # For model 2 an 3
from getAssigns import getAvailableSubjects, getAvailableSubjects_test, createCombinations
from adapty import adapty, adaptYModel5 # For model 2, 3 and 4

# declare constants
HOST = '0.0.0.0'
PORT = 8081

# initialize flask application
app = Flask(__name__) 
api = Api(app)

CORS(app, support_credentials=True)

# Función que regresa una lista de los códigos y nombres de las asignaturas que el estudiante no ha visto
@app.route('/api/getSubjects/<studentId>',methods=['POST'])
def getSubjectsCall(studentId):
    return jsonify(getAvailableSubjects(studentId)) 

    # UNCOMMENT THE NEXT LINE TO USE THE STUDENTS IN TEST SET
    # return jsonify(getAvailableSubjects_test(studentId))

# Función que regresa todas las combinaciones de materias posibles para un estudiante especifico
@app.route('/api/getCombinations/<assignsNumber>',methods=['POST'])
def getCombinationsCall(assignsNumber):
    data = request.get_json(force=True)
    return jsonify(createCombinations(data.get('availables'), data.get('preselected'), assignsNumber).tolist()) 


@app.route('/api/predict-model-2/<studentId>',methods=['POST']) #http://localhost:8081/api/predict
def predictModel2(studentId):

    #Before prediction
    K.clear_session()

    targetTrim = request.get_json(force=True)
    array_target_test = adapty(targetTrim)
    array_data_test = adaptX(studentId)

    modelPath = os.path.abspath('..\\datos\ordenados\\model2.pkl')
    model = joblib.load(open(modelPath,'rb'))

    output = model.predict([array_data_test, array_target_test])
    print(output, file=sys.stderr)

    #After prediction
    K.clear_session()
    return jsonify(output.tolist())

@app.route('/api/predict-model/<studentId>',methods=['POST']) #http://localhost:8081/api/predict
def predictModel(studentId):

    #Before prediction
    K.clear_session()

    targetTrim =  request.get_json(force=True)

    # UNCOMMENT THE NEXT LINE TO TEST WITH KNOWN TRIMESTRES
    # array_data_test = adaptX_test(studentId)

    array_data_test = adaptX(studentId)

    array_target_test, array_data_test = adaptYModel5(targetTrim, array_data_test)

    modelPath = os.path.abspath("../datos/modelos/model-5.0.pkl")
    model = joblib.load(open(modelPath,'rb'))

    output = model.predict([array_data_test, array_target_test])

    print(output, file=sys.stderr)

    outputs = []
    for o in output:
        outputs.append(o[0])

    order_index = np.argsort(outputs)[::-1][:10]

    final_subjects = []

    for oi in order_index:
        final_subjects.append({'subjects': targetTrim[oi], 'prediction': str(output[oi][0])})
       
    #After prediction
    K.clear_session()
    return jsonify(final_subjects)


if __name__ == '__main__':
    # run web server
    app.run(host=HOST,
            debug=True,  # automatic reloading enabled
            port=PORT) 