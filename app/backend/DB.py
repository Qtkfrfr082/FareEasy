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

@app.route('/get-user', methods=['GET'])
def get_user():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
    try:
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        user_data = user_doc.to_dict()
        return jsonify({'status': 'success', 'user': {
            'name': user_data.get('name', ''),
            'email': user_data.get('email', ''),
            'address': user_data.get('address', ''),
            'phone': user_data.get('phone', '')
        }}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to fetch user: {str(e)}'}), 500
    
@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    user_id = data.get('user_id')
    new_password = data.get('new_password')
    if not user_id or not new_password:
        return jsonify({'status': 'error', 'message': 'Missing user_id or new_password'}), 400
    try:
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        user_ref.update({'password': new_password})
        return jsonify({'status': 'success', 'message': 'Password updated successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to update password: {str(e)}'}), 500

@app.route('/update-user', methods=['POST'])
def update_user():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
    update_fields = {}
    for field in ['name', 'email', 'phone', 'address']:
        if field in data:
            update_fields[field] = data[field]
    if not update_fields:
        return jsonify({'status': 'error', 'message': 'No fields to update'}), 400
    try:
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        user_ref.update(update_fields)
        return jsonify({'status': 'success', 'message': 'User profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to update user: {str(e)}'}), 500
    
@app.route('/delete-transit', methods=['POST'])
def delete_transit():
    data = request.get_json()
    user_id = data.get('user_id')
    transit_id = data.get('transit_id')
    print('Delete request:', user_id, transit_id)
    if not user_id or not transit_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id or transit_id'}), 400
    try:
        user_transit_ref = db.collection('Users').document(user_id).collection('Transit').document(transit_id)
        user_transit_ref.delete()
        return jsonify({'status': 'success', 'message': 'Transit record deleted'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to delete transit: {str(e)}'}), 500
    
import hashlib
import json

@app.route('/recent-searches', methods=['POST'])
def receive_recent_searches():
    data = request.get_json()
    user_id = data.get('user_id')
    recent = data.get('recent')
    if not user_id or recent is None:
        return jsonify({'status': 'error', 'message': 'Missing user_id or recent searches'}), 400

    try:
        user_history_ref = db.collection('Users').document(user_id).collection('Recents')
        if recent:
            batch = db.batch()
            for item in recent:
                # Convert origin/destination to sorted JSON strings for uniqueness
                origin_str = json.dumps(item.get('origin'), sort_keys=True)
                destination_str = json.dumps(item.get('destination'), sort_keys=True)
                unique_str = f"{origin_str}_{destination_str}"
                item_id = hashlib.md5(unique_str.encode()).hexdigest()
                item['id'] = item_id
                item['timestamp'] = firestore.SERVER_TIMESTAMP
                doc_ref = user_history_ref.document(item_id)
                batch.set(doc_ref, item)
            batch.commit()
        return jsonify({'status': 'success', 'message': 'Recent searches saved/updated', 'count': len(recent)}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to save recent searches: {str(e)}'}), 500
    
from datetime import datetime
@app.route('/recent-searches', methods=['GET'])
def get_recent_searches():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
    try:
        user_history_ref = db.collection('Users').document(user_id).collection('Recents')
        # Order by timestamp descending and limit to 5
        recent_query = user_history_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(5)
        recent = []
        for doc in recent_query.stream():
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
        transit_data['created_at'] = firestore.SERVER_TIMESTAMP  # Add this line
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
        # Order by created_at descending
        transit_query = user_transit_ref.order_by('created_at', direction=firestore.Query.DESCENDING)
        transit = []
        for doc in transit_query.stream():
            item = doc.to_dict()
            item['id'] = doc.id
            transit.append(item)
        return jsonify({'transit': transit}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Failed to fetch transit: {str(e)}'}), 500
if __name__ == '__main__':
    app.run(debug=True)