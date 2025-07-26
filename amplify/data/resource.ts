import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Reservation: a
    .model({
      date: a.string(),
      room: a.string(),
      time: a.string(),
      name: a.string(),
      subject: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});