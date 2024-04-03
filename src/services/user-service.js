class UserService {
  #logger = null;
  #userRepository = null;

  constructor({ logger, userRepository }) {
    this.#logger = logger;
    this.#userRepository = userRepository;
  }

  async createUser(user) {
    const newUser = await this.#userRepository.addUser(user);
    this.#logger.log("info", `User created: ${newUser}`);

    return newUser;
  }

  async updateUser(userId, updateData) {
    const user = await this.findById(userId);
    const updated = await this.#userRepository.updateUser(userId, updateData);
    this.#logger.log("info", `User updated: ${user} to ${updated}`);

    return updated;
  }

  async deleteUser(userId) {
    const user = await this.findById(userId);
    await this.#userRepository.removeUser(userId);
    this.#logger.log("info", `Deleted user: ${user}`);
  }

  async findMany(options) {
    return await this.#userRepository.findBy(options);
  }

  async findById(userId) {
    return await this.#userRepository.findOneById(userId);
  }

  async findByEmail(email) {
    return await this.#userRepository.findOneByEmail(email);
  }
}

module.exports = UserService;
