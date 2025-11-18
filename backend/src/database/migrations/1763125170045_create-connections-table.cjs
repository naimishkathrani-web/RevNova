exports.up = pgm => {
  pgm.createTable('connections', {
    id: 'id',
    project_id: {
      type: 'integer',
      notNull: true,
      references: '"projects"',
      onDelete: 'cascade'
    },
    provider: { type: 'text', notNull: true },
    username: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = pgm => {
  pgm.dropTable('connections');
};
