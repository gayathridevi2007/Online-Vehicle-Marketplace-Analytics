import sys, os
sys.path.append(os.getcwd())
from app import create_app
app = create_app()
with app.app_context():
    from models.marketplace import MarketplaceModerator
    mods = MarketplaceModerator.query.all()
    for m in mods:
        print(m.id, m.email, getattr(m, 'is_active', getattr(m, 'active', None)))
