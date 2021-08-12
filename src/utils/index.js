const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: created_at,
  updatedAt: updated_at,
});

const mapDBToPlaylist = ({
  id,
  name,
  username,
})=>({
  id,name,username,
});

module.exports = { mapDBToModel, mapDBToPlaylist };