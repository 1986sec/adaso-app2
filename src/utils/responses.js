function success(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

function error(res, message, code = 'ERROR', status = 400) {
  return res.status(status).json({ error: true, message, code });
}

module.exports = { success, error };


