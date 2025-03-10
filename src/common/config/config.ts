export default (): { JWT_SECRET: string } => ({
  JWT_SECRET: process.env.JWT_SECRET || 'abcd',
});
