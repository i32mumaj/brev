from logging.config import fileConfig

from alembic import context

import brev.models  # noqa: F401  (registers the tables on Base.metadata)
from brev.db import Base, engine

if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)


def run_migrations_offline() -> None:
    context.configure(url=str(engine.url), target_metadata=Base.metadata, render_as_batch=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata, render_as_batch=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
