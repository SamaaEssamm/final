"""Merge all heads

Revision ID: 7ed00a2ea195
Revises: 38c53a7659a4, 38e7a2ad31a4, 5a9923ede271, f69771d2451d
Create Date: 2025-08-18 09:48:10.341463

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7ed00a2ea195'
down_revision = ('38c53a7659a4', '38e7a2ad31a4', '5a9923ede271', 'f69771d2451d')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
