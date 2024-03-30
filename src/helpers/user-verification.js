const env = require("../../dotenv");


module.exports = {
  createNonce,
  // deleteNonce, // For now, not exporting this until we need it.
  verifyNonce,
};

async function createNonce(user, namespace, nonceService) {
  const service    = nonceService;
  const duration   = 1000 * 60 * Number(env.VERIFICATION_CODE_EXPIRY);
  const nonce      = await service.createNonce();
  const boundNonce = getNamespacedNonce(nonce, namespace);

  await service.bindNonce(boundNonce, user, duration);

  return nonce;
}

async function deleteNonce(nonce, namespace, nonceService) {
  const service    = nonceService;
  const boundNonce = getNamespacedNonce(nonce, namespace);

  await service.deleteNonce(boundNonce);
}

async function verifyNonce(nonce, namespace, nonceService) {
  let user;
  const service    = nonceService;
  const boundNonce = getNamespacedNonce(nonce, namespace);

  if(!boundNonce) {
    user = null;
  } else {
    user = await service.validateNonce(boundNonce);
  }

  // after verifying the nonce, we have to delete it
  // so it cannot be re-used.
  // No need to await it. It can delete in the asynchronously,
  // so that we can return early to the user.
  deleteNonce(nonce, namespace, nonceService);

  return user;
}


// Helper functions
function getNamespacedNonce(nonce, namespace) {
  return namespace ? `${namespace}:${nonce}` : nonce;
}
