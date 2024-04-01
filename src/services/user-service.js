class UserService {
  constructor({ logger, UserRepository }) {
    this.logger = logger;
    this.userStore = UserRepository;
  }

  async createUser(user) {
    const newUser = await this.userStore.createUser(user);
    this.logger.log("info", `User created: ${newUser}`);

    return newUser;
  }

  async deleteUser(userId) {
    const user = await this.findById(userId);
    await this.userStore.deleteUser(userId);
    this.logger.log("info", `Deleted user: ${user}`);
  }

  async findMany(options) {
    return await this.userStore.findMany(options);
  }

  async findById(userId) {
    return await this.userStore.findById(userId);
  }

  async findByEmail(email) {
    return await this.userStore.findByEmail(email);
  }

  async updateUser(userId, updateData) {
    const user = await this.findById(userId);
    const updated = await this.userStore.updateUser(userId, updateData);
    this.logger.log("info", `User updated: ${user} to ${updated}`);

    return updated;
  }
}

module.exports = UserService;
