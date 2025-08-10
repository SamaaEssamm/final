from flask import Flask
from flask import request, jsonify
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import os
import enum
import uuid
import base64
from sqlalchemy.dialects.postgresql import UUID, ENUM, BYTEA, TIMESTAMP
from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
from flask import send_from_directory

from chatbot_api import ask_question_with_rerank
from sqlalchemy.orm import joinedload


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__, static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://sama:1234@localhost:5432/complaints_db'



db = SQLAlchemy(app)
migrate = Migrate(app, db)
api = Api(app)
CORS(app)

SUGGESTION_UPLOAD_FOLDER = os.path.join(app.root_path, 'static/uploads/suggestions')
COMPLAINT_UPLOAD_FOLDER = os.path.join(app.root_path, 'static/uploads/complaints')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'docx'}


app.config['SUGGESTION_UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/uploads/suggestions')
app.config['COMPLAINT_UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/uploads/complaints')


#app models
class UserRole(enum.Enum):
    student = "student"
    admin   = "admin"

class ComplaintType(enum.Enum):
    academic      = "Academic"
    activities    = "activities"
    administrative= "administrative"
    IT            = "IT"

class ComplaintDep(enum.Enum):
    public  = "public"
    private = "private"

class ComplaintStatus(enum.Enum):
    under_checking = "under_checking"
    under_review   = "under_review"
    in_progress    = "in_progress"
    done           = "done"

class SuggestionStatus(enum.Enum):
    reviewed = "reviewed"
    unreviewed = "unreviewed"

class SessionStatus(enum.Enum):
    open  = "open"
    close = "close"

class SenderType(enum.Enum):
    bot  = "bot"
    user = "user"

# Models
class NotificationModel(db.Model):
    __tablename__ = "notifications"

    notification_id       = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id               = db.Column(UUID(as_uuid=True), db.ForeignKey("users.users_id", ondelete="CASCADE"))
    notifications_message = db.Column(db.Text, nullable=False)
    notification_created_at = db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())
    notification_is_read  = db.Column(db.Boolean, default=False)
    complaint_id = db.Column(UUID(as_uuid=True), db.ForeignKey('complaints.complaint_id'), nullable=True)
    suggestion_id = db.Column(UUID(as_uuid=True), db.ForeignKey('suggestions.suggestion_id'), nullable=True)


class ComplaintModel(db.Model):
    __tablename__ = "complaints"

    complaint_id       = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id          = db.Column(UUID(as_uuid=True), db.ForeignKey("users.users_id", ondelete="CASCADE"))
    complaint_type     = db.Column(ENUM(ComplaintType), nullable=False, default=ComplaintType.academic)
    complaint_dep      = db.Column(ENUM(ComplaintDep), nullable=False, default=ComplaintDep.private)
    complaint_status   = db.Column(ENUM(ComplaintStatus), nullable=False, default=ComplaintStatus.under_checking)
    complaint_title    = db.Column(db.String(100))
    complaint_message  = db.Column(db.Text, nullable=False)
    complaint_file_url = db.Column(db.String(255))  # المسار النسبي أو الكامل للفايل
    complaint_file_name = db.Column(db.String(255))  # الاسم الأصلي
    complaint_created_at= db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())
    responder_id       = db.Column(UUID(as_uuid=True), db.ForeignKey("users.users_id", ondelete="SET NULL"))
    response_message   = db.Column(db.Text)
    response_created_at= db.Column(TIMESTAMP(timezone=True))
    reference_code = db.Column(db.BigInteger, server_default=db.text("nextval('complaint_code_seq')"))


    def to_dict(self):
        return {
        "complaint_id": str(self.complaint_id),
        "sender_id": str(self.sender_id) if self.sender_id else None,
        "complaint_type": self.complaint_type.name if self.complaint_type else None,
        "complaint_dep": self.complaint_dep.name if self.complaint_dep else None,
        "complaint_status": self.complaint_status.name if self.complaint_status else None,
        "complaint_title": self.complaint_title,
        "complaint_message": self.complaint_message,
        "complaint_file_url": self.complaint_file_url,
        "complaint_file_name": self.complaint_file_name,
        "complaint_created_at": self.complaint_created_at.isoformat() if self.complaint_created_at else None,
        "responder_id": str(self.responder_id) if self.responder_id else None,
        "response_message": self.response_message if self.response_message else None,
        "response_created_at": self.response_created_at.isoformat() if self.response_created_at else None,
        "reference_code": self.reference_code,
        }



class SuggestionModel(db.Model):
    __tablename__ = "suggestions"

    suggestion_id        = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    users_id             = db.Column(UUID(as_uuid=True), db.ForeignKey("users.users_id", ondelete="CASCADE"))
    reference_code = db.Column(db.BigInteger, server_default=db.text("nextval('suggestion_code_seq')"))
    suggestion_type      = db.Column(ENUM(ComplaintType), nullable=False, default=ComplaintType.academic)
    suggestion_dep       = db.Column(ENUM(ComplaintDep), nullable=False, default=ComplaintDep.private)
    suggestion_title     = db.Column(db.String(100))
    suggestion_message   = db.Column(db.Text, nullable=False)
    suggestion_file_url = db.Column(db.String(255))  # المسار النسبي أو الكامل للفايل
    suggestion_file_name = db.Column(db.String(255))  # الاسم الأصلي
    suggestion_created_at= db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())
    suggestion_status = db.Column(db.Enum(SuggestionStatus), nullable=False, default=SuggestionStatus.unreviewed)
    
 
    def to_dict(self):
        return {
            "suggestion_id": str(self.suggestion_id),
            "user_id": str(self.users_id) if self.users_id else None,
            "reference_code": int(self.reference_code) if self.reference_code is not None else None,
            "suggestion_title": self.suggestion_title,
            "suggestion_message": self.suggestion_message,
            "suggestion_type": self.suggestion_type.value if self.suggestion_type else None,
            "suggestion_dep": self.suggestion_dep.value if self.suggestion_dep else None,
            "suggestion_status": self.suggestion_status.value if self.suggestion_status else None,
            "suggestion_file_url": self.suggestion_file_url,
            "suggestion_file_name": self.suggestion_file_name,
            "suggestion_created_at": self.suggestion_created_at.isoformat() if self.suggestion_created_at else None
        }




class ChatMessageModel(db.Model):
    __tablename__ = "chat_messages"

    chat_id     = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id  = db.Column(UUID(as_uuid=True), db.ForeignKey("chat_sessions.sessions_id", ondelete="CASCADE"))
    sender      = db.Column(ENUM(SenderType), nullable=False, default=SenderType.user)
    message     = db.Column(db.Text, nullable=False)
    created_at  = db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())

class ChatSessionModel(db.Model):
    __tablename__ = "chat_sessions"

    sessions_id         = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    users_id            = db.Column(UUID(as_uuid=True), db.ForeignKey("users.users_id", ondelete="CASCADE"))
    session_created_at  = db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())
    session_ended_at    = db.Column(TIMESTAMP(timezone=True))
    session_title       = db.Column(db.Text, nullable=False)
    session_status      = db.Column(ENUM(SessionStatus), nullable=False, default=SessionStatus.open)

    messages            = db.relationship("ChatMessageModel", backref="session", cascade="all,delete-orphan")

class UserModel(db.Model):
    __tablename__ = "users"

    users_id        = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    users_name      = db.Column(db.Text, nullable=False)
    users_email     = db.Column(db.Text, unique=True, nullable=False)
    users_password  = db.Column(db.String(200), nullable=False)
    users_role      = db.Column(ENUM(UserRole), nullable=False, default=UserRole.student)
    users_created_at= db.Column(TIMESTAMP(timezone=True), server_default=db.func.now())

    complaints_sent = db.relationship("ComplaintModel", backref="sender", foreign_keys="ComplaintModel.sender_id")
    complaints_resp = db.relationship("ComplaintModel", backref="responder", foreign_keys="ComplaintModel.responder_id")
    notifications   = db.relationship("NotificationModel", backref="user", cascade="all,delete-orphan")
    suggestions     = db.relationship("SuggestionModel", backref="user", cascade="all,delete-orphan")
    sessions        = db.relationship("ChatSessionModel", backref="user", cascade="all,delete-orphan")

user_args = reqparse.RequestParser()
user_args.add_argument('name', type = str, required = True, help = "Name cannot be blank")
user_args.add_argument('email', type = str, required = True, help = "Email cannot be blank")
user_args.add_argument('password', type=str, required=True, help='Password is required')
user_args.add_argument('role', type=str, choices=('student', 'admin'), required= True, help='Role must be student or admin')

userfields = {
    'users_id': fields.String(attribute='users_id'),
    'users_name': fields.String(attribute='users_name'),
    'users_email': fields.String(attribute='users_email'),
    'users_password': fields.String(attribute='users_password'),
    'users_role': fields.String(attribute='users_role')
}

class Users(Resource):
    @marshal_with(userfields)
    def get(self):
        users = UserModel.query.all()
        return users
    
    @marshal_with(userfields)
    def post(self):
        args = user_args.parse_args()
        user = UserModel(users_name = args["name"], users_email = args["email"],
                         users_password = generate_password_hash(args["password"]),
                         users_role=UserRole(args["role"]) if args["role"] else UserRole.student)
        db.session.add(user)
        db.session.commit()
        users = UserModel.query.all()
        return users, 201
    

api.add_resource(Users, '/api/addusers/')

@app.route("/")
def home():
    return '<h1>HI</h1>'

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = UserModel.query.filter_by(users_email=email).first()

    if user and check_password_hash(user.users_password, password):
        return jsonify({"message": "Login successful", "role": user.users_role.name}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401
    
@app.route('/api/student/<email>', methods=['GET'])
def get_student_by_email(email):
    student = UserModel.query.filter_by(users_email=email).first()
    if student:
        return jsonify({
            'name': student.users_name,
            'email': student.users_email
        })
    else:
        return jsonify({'message': 'Student not found'}), 404

@app.route("/api/student/showcomplaints", methods=["GET"])
def get_complaints():
    student_email = request.args.get("student_email")  # ✅ Get from query string

    if not student_email:
        return jsonify({"message": "Missing email"}), 400

    user = UserModel.query.filter_by(users_email=student_email).first()

    if not user:
        return jsonify([])  # Return an empty list if user not found

    complaints = ComplaintModel.query.filter_by(sender_id=user.users_id).all()
    complaints_data = []
    for complaint in complaints:
        data = complaint.to_dict()
        data["complaint_status"] = complaint.complaint_status.value  # ✅ force enum to string
        print(complaint.complaint_status.value)
        complaints_data.append(data)

    return jsonify(complaints_data)  # ✅ Return array of complaints

@app.route("/api/student/get_complaint", methods=["GET"])
def get_single_complaint():
    complaint_id = request.args.get("id")
    student_email = request.args.get("student_email")

    if not complaint_id or not student_email:
        return jsonify({"message": "Missing parameters"}), 400

    user = UserModel.query.filter_by(users_email=student_email).first()
    if not user:
        return jsonify({"message": "Student not found"}), 404

    complaint = ComplaintModel.query.filter_by(
        complaint_id=complaint_id,
        sender_id=user.users_id
    ).first()

    if not complaint:
        return jsonify({"message": "Complaint not found"}), 404

    data = complaint.to_dict()
    data["complaint_status"] = complaint.complaint_status.value
    return jsonify(data)


@app.route('/api/student/addcomplaint', methods=['POST'])
def create_complaint():
    email = request.form.get('student_email')
    user = UserModel.query.filter_by(users_email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # بيانات الشكوى
    complaint_title = request.form.get('complaint_title')
    complaint_message = request.form.get('complaint_message')
    complaint_type = request.form.get('complaint_type')
    complaint_dep = request.form.get('complaint_dep')

    # تجهيز بيانات الملف
    file_url = None
    file_name = None
    file = request.files.get('file')  # ← لازم الاسم يكون مطابق في الفورم

    if file:
        filename = secure_filename(file.filename)
        file_path = app.config['COMPLAINT_UPLOAD_FOLDER']
        os.makedirs(file_path, exist_ok=True)
        full_path = os.path.join(file_path, filename)
        file.save(full_path)

        file_url = f"http://localhost:5000/static/uploads/complaints/{filename}"
        file_name = filename


    # إنشاء الشكوى
    new_complaint = ComplaintModel(
        complaint_title=complaint_title,
        complaint_message=complaint_message,
        complaint_type=complaint_type,
        complaint_dep=complaint_dep,
        sender_id=user.users_id,
        complaint_file_url=file_url,
        complaint_file_name=file_name
    )

    db.session.add(new_complaint)
    db.session.flush()

    # إشعارات
    admin = UserModel.query.filter_by(users_role='admin').first()
    if admin:
        notification = NotificationModel(
            user_id=admin.users_id,
            notifications_message=f"New complaint has been received.",
            complaint_id=new_complaint.complaint_id
        )
        db.session.add(notification)

    student_notification = NotificationModel(
        user_id=user.users_id,
        notifications_message="Your complaint has been received and is pending review.",
        complaint_id=new_complaint.complaint_id
    )
    db.session.add(student_notification)

    db.session.commit()

    return jsonify({"message": "Complaint submitted successfully."}), 201


@app.route("/api/student/showsuggestions", methods=["GET"])
def get_suggestions():
    student_email = request.args.get("student_email")
    if not student_email:
        return jsonify({"message": "Missing email"}), 400

    user = UserModel.query.filter_by(users_email=student_email).first()
    if not user:
        return jsonify([])

    suggestions = SuggestionModel.query.filter_by(users_id=user.users_id).all()
    return jsonify([s.to_dict() for s in suggestions]), 200


@app.route("/api/student/getsuggestion", methods=["GET"])
def get_student_suggestion():
    suggestion_id = request.args.get("id")
    student_email = request.args.get("student_email")

    if not suggestion_id or not student_email:
        return jsonify({"message": "Missing parameters"}), 400

    user = UserModel.query.filter_by(users_email=student_email).first()
    if not user:
        return jsonify({"message": "Student not found"}), 404

    suggestion = SuggestionModel.query.filter_by(
        suggestion_id=suggestion_id,
        users_id=user.users_id
    ).first()

    if not suggestion:
        return jsonify({"message": "Suggestion not found"}), 404


    return jsonify(suggestion.to_dict()), 200


@app.route('/api/student/addsuggestion', methods=['POST'])
def create_suggestion():
    email = request.form.get('student_email')
    user = UserModel.query.filter_by(users_email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    title = request.form.get('suggestion_title')
    message = request.form.get('suggestion_message')
    suggestion_type = request.form.get('suggestion_type')
    suggestion_dep = request.form.get('suggestion_dep')

    file = request.files.get('file')
    file_url = None
    file_name = None


    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = app.config['SUGGESTION_UPLOAD_FOLDER']
        os.makedirs(file_path, exist_ok=True)
        full_path = os.path.join(file_path, filename)
        file.save(full_path)

        file_url = f"http://localhost:5000/static/uploads/suggestions/{filename}"
        file_name = filename

    new_suggestion = SuggestionModel(
        suggestion_title=title,
        suggestion_message=message,
        suggestion_type=suggestion_type,
        suggestion_dep=suggestion_dep,
        users_id=user.users_id,
        suggestion_file_url=file_url,
        suggestion_file_name=file_name
    )

    db.session.add(new_suggestion)
    db.session.flush()
    # إشعار الإدمن
    admin = UserModel.query.filter_by(users_role='admin').first()
    if admin:
        admin_notification = NotificationModel(
            user_id=admin.users_id,
            notifications_message=f"New suggestion has been received",
            suggestion_id=new_suggestion.suggestion_id
        )
        db.session.add(admin_notification)

    # إشعار الطالب
    student_notification = NotificationModel(
        user_id=user.users_id,
        notifications_message="Your suggestion has been received. Thank you for sharing your thoughts!",
        suggestion_id=new_suggestion.suggestion_id
    )
    db.session.add(student_notification)

    db.session.commit()
    return jsonify(new_suggestion.to_dict()), 201



@app.route('/api/get_admin_name/<admin_email>', methods=['GET'])
def get_admin_by_email(admin_email):
    admin = UserModel.query.filter_by(users_email=admin_email).first()
    if admin:
        return jsonify({
            'status': 'success',
            'name': admin.users_name,
            'admin_email': admin.users_email
        })
    else:
        return jsonify({'status': 'fail', 'message': 'Admin not found'}), 404
    
@app.route('/api/admin/get_all_students', methods=['GET'])
def get_all_students():
    students = UserModel.query.filter_by(users_role='student').all()
    student_list = []

    for student in students:
        student_list.append({
            "users_id": student.users_id,
            "users_name": student.users_name,
            "users_email": student.users_email
        })

    return jsonify(student_list)

@app.route('/api/admin/add_student', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data.get('users_name')
    email = data.get('users_email')
    password = data.get('users_password')

    if not all([name, email, password]):
        return jsonify({'status': 'fail', 'message': 'Missing fields'}), 400

    existing_user = UserModel.query.filter_by(users_email=email).first()
    if existing_user:
        return jsonify({'status': 'fail', 'message': 'Email already exists'}), 409
    
    hashed_password = generate_password_hash(password)

    new_student = UserModel(
        users_name=name,
        users_email=email,
        users_password=hashed_password,  # Consider hashing passwords!
        users_role='student'
    )

    db.session.add(new_student)
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'Student added successfully'})

@app.route('/api/admin/update_student', methods=['PUT'])
def update_student():
    data = request.get_json()
    old_email = data.get('old_email')
    new_name = data.get('new_name')
    new_password = data.get('new_password')
    new_email = data.get('new_email')

    student = UserModel.query.filter_by(users_email=old_email).first()
    if not student:
        return jsonify({'status': 'fail', 'message': 'Student not found'}), 404

    if new_name:
        student.users_name = new_name
    if new_password:
        hashed_password = hashed_password = generate_password_hash(new_password)
        student.users_password = hashed_password
    if new_email:
        student.users_email = new_email

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Student updated successfully'})

@app.route('/api/admin_delete_student', methods=['DELETE'])
def delete_student():
    data = request.get_json()
    email = data.get('email')

    student = UserModel.query.filter_by(users_email=email).first()
    if not student:
        return jsonify({'status': 'fail', 'message': 'Student not found'}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Student deleted successfully'})

@app.route('/api/admin/get_all_complaints', methods=['GET'])
def get_all_complaints():
    complaints = ComplaintModel.query.all()
    results = []

    for c in complaints:
        student_email = 'Unknown'
        
        # Check if the complaint is public and student exists
        if c.complaint_dep.name == "public":  # or c.complaint_dep.value == 'public' if `.value` gives you the raw string
            student = UserModel.query.filter_by(users_id=c.sender_id).first()
            if student:
                student_email = student.users_email

        results.append({
            'complaint_id': c.complaint_id,
            'reference_code': c.reference_code,
            'complaint_title': c.complaint_title,
            'complaint_message': c.complaint_message,
            'complaint_dep' : str(c.complaint_dep.name),
            'complaint_type': str(c.complaint_type.name),
            'complaint_status': str(c.complaint_status.value),
            'complaint_date': c.complaint_created_at.strftime("%Y-%m-%d"),
            'response_message': c.response_message,
            'complaint_visibility': str(c.complaint_dep.value),
            'student_email': student_email
        })
        
    return jsonify(results)

@app.route('/api/admin/get_complaint', methods=['GET'])
def get_complaint_by_id():
    complaint_id = request.args.get("id")
    if not complaint_id:
        return jsonify({'status': 'fail', 'message': 'Missing complaint ID'}), 400

    complaint = ComplaintModel.query.filter_by(complaint_id=complaint_id).first()

    if not complaint:
        return jsonify({'status': 'fail', 'message': 'Complaint not found'}), 404

    # Get admin name if responded
    responder_name = None
    if complaint.responder_id:
        admin = UserModel.query.get(complaint.responder_id)
        if admin:
            responder_name = admin.users_name
    # Construct response
    return jsonify({
        "status": "success",
        "complaint_id": str(complaint.complaint_id),
        'reference_code': c.reference_code,
        "complaint_title": complaint.complaint_title,
        "complaint_message": complaint.complaint_message,
        "complaint_type": complaint.complaint_type.name if complaint.complaint_type else None,
        "complaint_dep": complaint.complaint_dep.name if complaint.complaint_dep else None,
        "complaint_status": complaint.complaint_status.name if complaint.complaint_status else None,
        "complaint_created_at": complaint.complaint_created_at.isoformat() if complaint.complaint_created_at else None,
        "student_email": complaint.sender.users_email if complaint.sender else None,
        "complaint_file_name": complaint.complaint_file_name,
        "complaint_file_url": complaint.complaint_file_url,
        "response_message": complaint.response_message if complaint.response_message else None,
        "response_created_at": complaint.response_created_at.isoformat() if complaint.response_created_at else None,
        "responder_name": responder_name
    })


@app.route('/api/admin/get_all_suggestions', methods=['GET'])
def get_all_suggestions():
    suggestion_dep = request.args.get('dep')  # مثلاً: public أو private

    if suggestion_dep and suggestion_dep.lower() in ['public', 'private']:
        suggestions = SuggestionModel.query.filter(SuggestionModel.suggestion_dep == suggestion_dep.lower()).all()
    else:
        suggestions = SuggestionModel.query.all()

    results = []

    for s in suggestions:
        data = s.to_dict()
        student = UserModel.query.filter_by(users_id=s.users_id).first()
        data['student_email'] = (
            student.users_email if student and s.suggestion_dep.value == 'public' else 'Unknown'
        )
        results.append(data)

    return jsonify(results), 200


@app.route('/api/admin/get_suggestion', methods=['GET'])
def get_suggestion_by_id():
    suggestion_id = request.args.get('id')
    if not suggestion_id:
        return jsonify({'status': 'fail', 'message': 'suggestion ID is required'}), 400

    try:
        uuid_obj = uuid.UUID(suggestion_id)
        suggestion = SuggestionModel.query.filter_by(suggestion_id=uuid_obj).first()
    except ValueError:
        return jsonify({'status': 'fail', 'message': 'Invalid UUID format'}), 400

    if not suggestion:
        return jsonify({'status': 'fail', 'message': 'suggestion not found'}), 404

    student = UserModel.query.filter_by(users_id=suggestion.users_id).first()


    return jsonify({
        'suggestion_id': str(suggestion.suggestion_id),
        'suggestion_title': suggestion.suggestion_title,
        'suggestion_message': suggestion.suggestion_message,
        'suggestion_type': str(suggestion.suggestion_type.name),
        'suggestion_dep': str(suggestion.suggestion_dep),
        'suggestion_date': suggestion.suggestion_created_at,
        'student_email': student.users_email if student and suggestion.suggestion_dep.name == "public" else "Unknown",
        'suggestion_status': str(suggestion.suggestion_status.value),
        'suggestion_file_name': suggestion.suggestion_file_name,
        'suggestion_file_url': suggestion.suggestion_file_url


    })


@app.route('/api/admin/update_suggestion_status', methods=['POST', 'OPTIONS'])
def update_suggestion_status():
    if request.method == 'OPTIONS':
        return '', 204  # مهم علشان يرد على الـ preflight

    data = request.get_json()
    suggestion_id = data.get("suggestion_id")
    new_status = data.get("new_status")

    suggestion = SuggestionModel.query.filter_by(suggestion_id=suggestion_id).first()
    if not suggestion:
        return jsonify({"status": "error", "message": "Suggestion not found"}), 404

    suggestion.suggestion_status = new_status
    db.session.commit()

    return jsonify({"status": "success", "message": "Status updated successfully"})

@app.route('/api/admin/update_status', methods=['POST'])
def update_status():
    data = request.get_json()
    required_fields = ['complaint_id', 'new_status']

    if not all(k in data for k in required_fields):
        return jsonify({'status': 'fail', 'message': 'Missing required fields'}), 400

    try:
        complaint_id = uuid.UUID(data['complaint_id'])  # Ensure it's a UUID object
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid complaint_id'}), 400

    complaint = ComplaintModel.query.filter_by(complaint_id=complaint_id).first()

    if not complaint:
        return jsonify({'status': 'fail', 'message': 'Complaint not found'}), 404

    try:
        complaint.complaint_status = ComplaintStatus(data['new_status'])
    except ValueError:
        return jsonify({'status': 'fail', 'message': 'Invalid complaint_status'}), 400

    db.session.commit()

    return jsonify({'status': 'success'})

@app.route('/api/admin/respond', methods=['POST'])
def respond_to_complaint():
    data = request.get_json()
    complaint_id = data.get('complaint_id')
    response_message = data.get('response_message')
    admin_id = data.get('admin_id')

    if not all([complaint_id, response_message, admin_id]):
        return jsonify({'status': 'fail', 'reason': 'Missing required fields'})

    complaint = ComplaintModel.query.get(complaint_id)

    if complaint and not complaint.response_message:
        complaint.response_message = response_message

        complaint.responder_id = admin_id  # <-- You must have this column in the model

        # 🆕 Send notification to student
        student_id = complaint.sender_id
        notification = NotificationModel(
        user_id=student_id,
        notifications_message="Your complaint has been answered. Click to view.",
        complaint_id=complaint.complaint_id  # ✅ لازم يتحط علشان يحصل توجيه
    )

        db.session.add(notification)
        """
        error in merge

        complaint.complaint_status = 'done'  # ✅ Set status to responded
        complaint.response_created_at = datetime.now(timezone.utc)
"""
        db.session.commit()
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'fail', 'reason': 'Invalid complaint or already responded'})

@app.route('/api/get_admin_id', methods=['GET'])
def get_admin_id():
    admin_email = request.args.get("admin_email")
    admin = UserModel.query.filter_by(users_email=admin_email).first()

    if admin:
        return jsonify({
            'status': 'success',
            'admin_id': admin.users_id
        })
    else:
        return jsonify({'status': 'fail', 'reason': 'Admin not found'})



@app.route('/api/admin/notifications', methods=['GET'])
def get_admin_notifications():
    email = request.args.get("admin_email")
    admin = UserModel.query.filter_by(users_email=email, users_role='admin').first()
    if not admin:
        return jsonify([])

    notifications = NotificationModel.query.filter_by(user_id=admin.users_id).order_by(NotificationModel.notification_created_at.desc()).all()

    return jsonify([
        {
            "id": str(n.notification_id),
            "message": n.notifications_message,
            "is_read": n.notification_is_read,
            "created_at": n.notification_created_at.isoformat(),
            "complaint_id": str(n.complaint_id) if n.complaint_id else None,
            "suggestion_id": str(n.suggestion_id) if n.suggestion_id else None
        }
        for n in notifications
    ])

@app.route('/api/admin/mark_notification_read', methods=['POST'])
def mark_notification_read():
    data = request.get_json()
    notif_id = data.get('notification_id')

    notification = NotificationModel.query.filter_by(notification_id=notif_id).first()
    if not notification:
        return jsonify({"status": "fail", "message": "Notification not found"}), 404

    notification.notification_is_read = True
    db.session.commit()
    return jsonify({"status": "success"})

@app.route('/api/student/notifications', methods=['GET'])
def get_student_notifications():
    email = request.args.get("student_email")
    student = UserModel.query.filter_by(users_email=email, users_role='student').first()
    if not student:
        return jsonify([])

    notifications = NotificationModel.query.filter_by(user_id=student.users_id).order_by(NotificationModel.notification_created_at.desc()).all()

    return jsonify([
        {
            "id": str(n.notification_id),
            "message": n.notifications_message,
            "is_read": n.notification_is_read,
            "created_at": n.notification_created_at.isoformat(),
            "complaint_id": str(n.complaint_id) if n.complaint_id else None,
            "suggestion_id": str(n.suggestion_id) if n.suggestion_id else None
        }
        for n in notifications
    ])

@app.route('/api/student/mark_notification_read', methods=['POST'])
def mark_student_notification_read():
    data = request.get_json()
    notif_id = data.get('notification_id')

    notification = NotificationModel.query.filter_by(notification_id=notif_id).first()
    if not notification:
        return jsonify({"status": "fail", "message": "Notification not found"}), 404

    notification.notification_is_read = True
    db.session.commit()
    return jsonify({"status": "success"})
@app.route('/static/uploads/complaints/<filename>')
def uploaded_complaint_file(filename):
    return send_from_directory(app.config['COMPLAINT_UPLOAD_FOLDER'], filename)

@app.route('/static/uploads/suggestions/<filename>')
def uploaded_suggestion_file(filename):
    return send_from_directory(app.config['SUGGESTION_UPLOAD_FOLDER'], filename)


#done
@app.route("/api/chat/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question")
    session_id = data.get("session_id")
    user_email = data.get("user_email")

    if not question or not user_email:
        return jsonify({"error": "Missing question or user_email"}), 400

    user = db.session.query(UserModel).filter_by(users_email=user_email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id = user.users_id

    # If session_id not provided, get the latest session
    if not session_id:
        latest_session = (
            db.session.query(ChatSessionModel)
            .filter_by(user_id=user_id)
            .order_by(ChatSessionModel.created_at.desc())
            .first()
        )
        if latest_session:
            session_id = latest_session.session_id
        else:
            return jsonify({"error": "No active chat session found"}), 404

    # Call your rerank-based Groq response generator
    answer = ask_question_with_rerank(question)

    # Save the question and answer in DB
    question_msg = ChatMessageModel(
        session_id=session_id,
        sender='user',
        message=question
    )
    answer_msg = ChatMessageModel(
        session_id=session_id,
        sender='bot',
        message=answer
    )

    db.session.add_all([question_msg, answer_msg])
    db.session.commit()

    # Get the chat session by ID
    session = db.session.query(ChatSessionModel).filter_by(sessions_id=session_id).first()

# Count only user/bot messages (ignore "New Chat Started" system message)
    real_messages_count = (
    db.session.query(ChatMessageModel)
    .filter(
        ChatMessageModel.session_id == session.sessions_id,
        ChatMessageModel.sender.in_(["user", "bot"])
    )
    .count()
    )
# Set title only after the first actual user+bot exchange
    if session and real_messages_count == 3:
        session.session_title = question[:30] + "..." if len(question) > 30 else question
    db.session.commit()




    return jsonify({"answer": answer})


#done
@app.route("/api/chat/start_session", methods=["POST"])
def start_session():
    data = request.get_json()
    email = data.get("email")
    first_message = data.get("message", "")

    user = UserModel.query.filter_by(users_email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Close previous sessions
    ChatSessionModel.query.filter_by(users_id=user.users_id, session_status=SessionStatus.open).update(
        {ChatSessionModel.session_status: SessionStatus.close}
    )

    # Create new session
    # Create new chat session (no need to assign sessions_id manually)
    new_session = ChatSessionModel(
    users_id=user.users_id,
    session_title=first_message or "New Chat",
    session_status=SessionStatus.open
    )
    db.session.add(new_session)
    db.session.flush()  # Generates sessions_id and keeps it accessible

# Now add the first message, using the generated session_id
    if first_message:
        new_msg = ChatMessageModel(
        session_id=new_session.sessions_id,
        sender=SenderType.user,
        message=first_message
    )
    db.session.add(new_msg)

# Commit everything
    db.session.commit()


    return jsonify({
        "session_id": str(new_session.sessions_id),
        "title": new_session.session_title,
        "created_at": new_session.session_created_at
    })

#done
@app.route("/api/chat/messages", methods=["GET"])
def get_messages():
    session_id = request.args.get("session_id")
    messages = ChatMessageModel.query.filter_by(session_id=session_id).order_by(ChatMessageModel.created_at).all()

    return jsonify([
        {
            "sender": m.sender.value,
            "text": m.message,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ])

#done
@app.route("/api/chat/send_message", methods=["POST"])
def send_message():
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message")

    if not session_id or not user_message:
        return jsonify({"error": "Missing session_id or message"}), 400

    # Add user message
    user_msg = ChatMessageModel(
        session_id=session_id,
        sender=SenderType.user,
        message=user_message
    )
    db.session.add(user_msg)

    # 🧠 Placeholder bot logic — you can replace with your Groq/Mixtral call
    bot_reply = f"Bot received: {user_message}"

    bot_msg = ChatMessageModel(
        session_id=session_id,
        sender=SenderType.bot,
        message=bot_reply
    )
    db.session.add(bot_msg)

    db.session.commit()

    return jsonify({
        "bot_reply": bot_reply
    })


#done
@app.route("/api/chat/close_session", methods=["PATCH"])
def close_session():
    data = request.get_json()
    session_id = data.get("session_id")

    session = ChatSessionModel.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404

    session.session_status = SessionStatus.close
    db.session.commit()
    return jsonify({"status": "closed"})

#done
@app.route("/api/chat/sessions", methods=["GET"])
def get_chat_sessions():
    email = request.args.get("email")
    print(email, " Hi");
    user = UserModel.query.filter_by(users_email=email).first()
    if not user:
        return jsonify([])  # Return empty list if user doesn't exist

    sessions = ChatSessionModel.query.filter_by(users_id=user.users_id).order_by(ChatSessionModel.session_created_at.desc()).all()

    return jsonify([
        {
            "session_id": str(s.sessions_id),
            "title": s.session_title,
            "created_at": s.session_created_at.isoformat()
        }
        for s in sessions
    ])


if __name__ == '__main__':
    app.run(debug=True)