export default function (ctx, callback) {
  const _ = require('lodash');
  const getInvites = () => ctx.read()
    .then((data) => {
      data.invites = data.invites || {};
      return data;
    });

  const getInvite = (id, email) => getInvites()
    .then((data) => {
      if (email) return data.invites[ email ];
      return _.find(data.invites, invite => invite.id === id);
    });

  switch (ctx.method) {
    case 'store-new-invite': {
      getInvites()
        .then((data) => {
          data.invites[ ctx.payload.email ] = ctx.payload;
          return ctx.write(data);
        })
        .then(() => {
          callback(null, ctx.payload);
        })
        .catch((e) => {
          callback(e);
        });
      break;
    }

    case 'fetch-invite': {
      const { payload: { email, id } } = ctx;
      getInvite(id, email)
        .then((invite) => {
          callback(null, invite);
        })
        .catch((e) => {
          callback(e);
        });
      break;
    }

    case 'fetch-invites': {
      const {
        payload: {
          search,
          sortProperty,
          sortOrder,
          perPage,
          page
        }
      } = ctx;

      getInvites()
        .then((data) => {
          // get all invites in an array
          const invites = _.values(data.invites);

          // filter the invites based on the incoming search string
          const filteredInvites = search ? invites.filter(invite => invite.email.includes(search)) : invites;

          // Sort the invites by the sortProperty and sortOrder
          filteredInvites.sort((a, b) => {
            if (a[ sortProperty ] > b[ sortProperty ]) return sortOrder;
            if (a[ sortProperty ] < b[ sortProperty ]) return -sortOrder;
            return 0;
          });

          // Find the right page of invites
          const pagedInvites = filteredInvites.slice(perPage * page, perPage * (page + 1));

          // Map the public fields only (don't return private fields such as the "token" field)
          const mappedInvites = pagedInvites.map(invite => ({
            id: invite.id,
            email: invite.email,
            createdAt: invite.createdAt,
            expiresAt: invite.expiresAt
          }));

          callback(null, {
            length: mappedInvites.length,
            limit: perPage,
            start: perPage * page,
            total: invites.length,
            invites: mappedInvites
          });
        })
        .catch((e) => {
          callback(e);
        });
      break;
    }

    case 'delete-invite': {
      const { payload: { email, id } } = ctx;
      getInvite(id, email)
        .then((invite) => {
          if (!invite) {
            callback('Invite not found');
          } else {
            getInvites()
              .then((data) => {
                _.unset(data.invites, invite.email);
                return ctx.write(data);
              })
              .then(() => {
                callback(null, null);
              })
              .catch((e) => {
                callback(e);
              });
          }
        })
        .catch((e) => {
          callback(e);
        });
      break;
    }

    default:
      callback(`Unknown context method: ${ctx.method}`);
  }
}
