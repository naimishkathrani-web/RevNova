exports.up = pgm => {
  pgm.addColumn('projects', {
    status: {
      type: 'text',
      notNull: false,
      default: 'active'
    }
  });
};

exports.down = pgm => {
  pgm.dropColumn('projects', 'status');
};
