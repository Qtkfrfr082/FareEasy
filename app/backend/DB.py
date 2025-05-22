from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("fareeary-59dd0-firebase-adminsdk-fbsvc-bf1882cb10.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Missing email or password'}), 400
    try:
        users_ref = db.collection('Users')
        user_docs = list(users_ref.where('email', '==', email).where('password', '==', password).stream())
        if not user_docs:
            return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
        user_id = user_docs[0].id
        return jsonify({'status': 'success', 'message': 'Login successful', 'user_id': user_id}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to login: {str(e)}'}), 500
    
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'status': 'error', 'message': 'Missing name, email, or password'}), 400

    try:
        users_ref = db.collection('Users')
        existing = list(users_ref.where('email', '==', data['email']).stream())
        if existing:
            return jsonify({'status': 'error', 'message': 'Email already registered'}), 409

        # Add user with auto-generated document ID
        user_ref = users_ref.add({
            'name': data['name'],
            'email': data['email'],
            'password': data['password'],  # WARNING: Hash passwords in production!
        })
        user_id = user_ref[1].id  # user_ref is (write_result, doc_ref)
        return jsonify({'status': 'success', 'message': 'Signup successful!', 'user_id': user_id}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to signup: {str(e)}'}), 500

@app.route('/recent-searches', methods=['POST'])
def receive_recent_searches():
    data = request.get_json()
    user_id = data.get('user_id')
    recent = data.get('recent')
    if not user_id or not recent:
        return jsonify({'status': 'error', 'message': 'Missing user_id or recent searches'}), 400

    try:
        # Save each recent search as a document in the user's History subcollection
        user_history_ref = db.collection('Users').document(user_id).collection('History')
        batch = db.batch()
        # Optionally clear previous history for this user
        for doc in user_history_ref.stream():
            doc.reference.delete()
        for item in recent:
            doc_ref = user_history_ref.document(item['id'])
            batch.set(doc_ref, item)
        batch.commit()
        return jsonify({'status': 'success', 'message': 'Recent searches saved to history', 'count': len(recent)}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to save recent searches: {str(e)}'}), 500

@app.route('/recent-searches', methods=['GET'])
def get_recent_searches():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
    try:
        user_history_ref = db.collection('Users').document(user_id).collection('History')
        recent = []
        for doc in user_history_ref.stream():
            item = doc.to_dict()
            item['id'] = doc.id
            recent.append(item)
        return jsonify({'recent': recent}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to fetch recent searches: {str(e)}'}), 500

@app.route('/save-transit', methods=['POST'])
def save_transit():
    data = request.get_json()
    user_id = data.get('user_id')
    transit_data = data.get('transit')
    if not user_id or not transit_data:
        return jsonify({'status': 'error', 'message': 'Missing user_id or transit data'}), 400

    try:
        user_transit_ref = db.collection('Users').document(user_id).collection('Transit')
        transit_ref = user_transit_ref.document()
        transit_ref.set(transit_data)
        return jsonify({'status': 'success', 'message': 'Transit saved to history'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to save transit: {str(e)}'}), 500

@app.route('/get-transit', methods=['GET'])
def get_transit():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
    try:
        user_transit_ref = db.collection('Users').document(user_id).collection('Transit')
        transit = []
        for doc in user_transit_ref.stream():
            item = doc.to_dict()
            item['id'] = doc.id
            transit.append(item)
        return jsonify({'transit': transit}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to fetch transit: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)