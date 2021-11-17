export const universalResolverUrl = 'https://resolver.identity.foundation/1.0/identifiers';

const DidResolver = {
  value: universalResolverUrl,

  set url (value) {
    this.value = value;
  },

  get url (): string {
    return this.value;
  }
};

export default DidResolver;
