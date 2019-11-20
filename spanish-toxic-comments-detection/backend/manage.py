import os
import json
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from TwitterSearch import TwitterSearchOrder, TwitterSearch, TwitterSearchException
from lstm_model import rank_texts
from keys import keys

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/comments/<keywords>')
@cross_origin()
def hello_world(keywords):
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    try:
        tso = TwitterSearchOrder()
        tso.set_keywords([keywords])
        ts = TwitterSearch(keys)
        tweets = []
        for tweet in ts.search_tweets_iterable(tso):
            tweets.append(tweet['text'])
    except TwitterSearchException as e:
        print(e)
    response = jsonify({'status': 200, 'results': tweets})
    return response

@app.route('/rank/', methods=['GET', 'POST'])
@cross_origin()
def rank_text():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    if(request.method == 'POST'):
        req_data = request.get_json()
        texts = req_data['texts']
        if texts is not None:
            if len(texts) == 0:
                response = jsonify({'status': 204, 'error': 'texts array is empty'})
                return response
            else:
                results = rank_texts(texts)
                mappedData = []
                for i in range(len(results)):
                    entry = {'text': texts[i], 'toxic': results[i].tolist()}
                    mappedData.append(entry)
                data = {'status': 200, 'results': mappedData}
                print(data)
                response = jsonify(data);
                return response
        else:
            response = jsonify({'status': 204, 'error': 'texts is None'})
            return response
    else:
        response = jsonify({'status': 204, 'error': 'request is not post'})
        return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)