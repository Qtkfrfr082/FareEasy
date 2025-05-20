from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

cred = credentials.Certificate("fareeary-59dd0-firebase-adminsdk-fbsvc-bf1882cb10.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/recent-searches', methods=['POST'])
def receive_recent_searches():
    data = request.get_json()
    if not data or 'recent' not in data:
        return jsonify({'status': 'error', 'message': 'No recent searches provided'}), 400
    recent = data['recent']
    # Save each recent search as a document in the 'history' collection
    batch = db.batch()
    history_ref = db.collection('History')
    # Optionally clear previous history if you want to overwrite
    # Delete all previous documents in 'history'
    for doc in history_ref.stream():
        doc.reference.delete()
    # Add new recent searches
    for item in recent:
        doc_ref = history_ref.document(item['id'])
        batch.set(doc_ref, item)
    batch.commit()
    return jsonify({'status': 'success', 'message': 'Recent searches saved to history', 'count': len(recent)}), 200

@app.route('/recent-searches', methods=['GET'])
def get_recent_searches():
    history_ref = db.collection('History')
    recent = []
    for doc in history_ref.stream():
        item = doc.to_dict()
        item['id'] = doc.id
        recent.append(item)
    return jsonify({'recent': recent}), 200

@app.route('/save-transit', methods=['POST'])
def save_transit():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No transit data provided'}), 400

    try:
        # Save each transit as a document in the 'Transit' collection
        transit_ref = db.collection('Transit').document()
        transit_ref.set(data)
        return jsonify({'status': 'success', 'message': 'Transit saved to history'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to save transit: {str(e)}'}), 500
if __name__ == '__main__':
    app.run(debug=True)