class UserRepository {
  #dataSource = null;
  
  constructor({ dataSource }) {
    this.#dataSource = dataSource;
  }
  
  async addUser(user) {
    return await this.#dataSource.createUser(user);
  }
  
  async updateUser(id, updateData) {
    return await this.#dataSource.updateUser(id, updateData);
  }
  
  async removeUser(id) {
    return await this.#dataSource.deleteUser(id);
  }
  
  /**
     * @return User[] an array of User objects
     */
  async findByFirstname(firstname) {
    return await this.findBy({ firstname });
  }
  
  /**
     * @return User[] an array of User objects
     */
  async findByLastname(lastname) {
    return await this.findBy({ lastname });
  }
  
  /**
     * @return {User} A single user identified by email
     *  or null if there is no such user.
     */
  async findOneByEmail(email) {
    return await this.#dataSource.findOneByEmail(email);
  }
  
  /**
     * @return {User} A single user identified by id
     *  or null if there is no such user.
     */
  async findOneById(id) {
    return await this.#dataSource.findOneById(id);
  }
  
  /**
     * @param {Object} with attributes:
     *   firstname, lastname, email
     *   findBy({ firsname: "James", lastname: "Madison" })
     */
  async findBy(attributes) {
    return await this.#dataSource.findMany(attributes);
  }
}
  
module.exports = UserRepository;
  