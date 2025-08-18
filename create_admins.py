from api import app, db
from models import UserModel, UserRole
import uuid
from werkzeug.security import generate_password_hash

def create_admins():
    with app.app_context(): 
        admin1 = UserModel(
            users_id=uuid.uuid4(),
            users_name="Admin 1",
            users_email="admin1@example.com",
            users_password=generate_password_hash("password123"),
            users_role=UserRole.admin
        )

        admin2 = UserModel(
            users_id=uuid.uuid4(),
            users_name="Admin 2",
            users_email="admin2@example.com",
            users_password=generate_password_hash("password456"),
            users_role=UserRole.admin
        )

        db.session.add_all([admin1, admin2])
        db.session.commit()
        print("✅ Admins created successfully!")

if __name__ == "__main__":
    create_admins()
