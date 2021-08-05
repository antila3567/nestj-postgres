import ormconfig from '@app/ormconfig';

const ormseedconfig = {
  ...ormconfig,
  migrations: [__dirname + '/seeds/**/*{.ts, .js}'],
  cli: {
    migrationDir: 'src/seeds',
  },
};

export default ormseedconfig;
