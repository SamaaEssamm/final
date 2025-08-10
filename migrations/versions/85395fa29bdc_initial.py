"""Initial

Revision ID: 85395fa29bdc
Revises: 
Create Date: 2025-08-07 14:51:20.871744

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '85395fa29bdc'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # تعديل constraints في جدول notifications
    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('notifications_complaint_id_fkey'), type_='foreignkey')
        batch_op.drop_constraint(batch_op.f('notifications_suggestion_id_fkey'), type_='foreignkey')
        batch_op.create_foreign_key(None, 'complaints', ['complaint_id'], ['complaint_id'])
        batch_op.create_foreign_key(None, 'suggestions', ['suggestion_id'], ['suggestion_id'])

    # 1. احذف الـ default مؤقتًا
    with op.batch_alter_table('suggestions', schema=None) as batch_op:
        batch_op.alter_column(
            'suggestion_status',
            server_default=None
        )

    # 2. حول النوع من VARCHAR إلى ENUM
    op.alter_column(
        'suggestions',
        'suggestion_status',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.Enum('reviewed', 'unreviewed', name='suggestionstatus'),
        postgresql_using="suggestion_status::suggestionstatus"
    )

    # 3. أضف الـ default من جديد
    with op.batch_alter_table('suggestions', schema=None) as batch_op:
        batch_op.alter_column(
            'suggestion_status',
            server_default=sa.text("'unreviewed'::suggestionstatus"),
            nullable=False
        )

       # إنشاء sequences
    op.execute("CREATE SEQUENCE complaint_code_seq START 11000")
    op.execute("CREATE SEQUENCE suggestion_code_seq START 22000")

    # إضافة الأعمدة
    op.add_column('complaints', sa.Column('reference_code', sa.BigInteger(), server_default=sa.text("nextval('complaint_code_seq')")))
    op.add_column('suggestions', sa.Column('reference_code', sa.BigInteger(), server_default=sa.text("nextval('suggestion_code_seq')")))


    # ### end Alembic commands ###


def downgrade():
    with op.batch_alter_table('suggestions', schema=None) as batch_op:
        batch_op.alter_column(
            'suggestion_status',
            existing_type=sa.Enum('reviewed', 'unreviewed', name='suggestionstatus'),
            type_=sa.VARCHAR(length=20),
            nullable=True,
            existing_server_default=sa.text("'unreviewed'::character varying"),
            postgresql_using="suggestion_status::varchar"
        )

    # حذف الـ ENUM من PostgreSQL بعد التراجع
    sa.Enum(name='suggestionstatus').drop(op.get_bind())

    with op.batch_alter_table('notifications', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(batch_op.f('notifications_suggestion_id_fkey'), 'suggestions', ['suggestion_id'], ['suggestion_id'], ondelete='CASCADE')
        batch_op.create_foreign_key(batch_op.f('notifications_complaint_id_fkey'), 'complaints', ['complaint_id'], ['complaint_id'], ondelete='CASCADE')

    op.drop_column('complaints', 'reference_code')
    op.drop_column('suggestions', 'reference_code')
    op.execute("DROP SEQUENCE complaint_code_seq")
    op.execute("DROP SEQUENCE suggestion_code_seq")
    # ### end Alembic commands ###
