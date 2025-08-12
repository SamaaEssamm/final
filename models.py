from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID, ENUM, TIMESTAMP

db = SQLAlchemy()



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
