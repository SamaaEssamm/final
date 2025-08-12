complaint_type | complaint_dep
from alembic import op

def upgrade():
    with op.batch_alter_table('complaints') as batch_op:
        batch_op.alter_column('complaint_type', new_column_name='complaint_dep')

def downgrade():
    with op.batch_alter_table('complaints') as batch_op:
        batch_op.alter_column('complaint_dep', new_column_name='complaint_type')
