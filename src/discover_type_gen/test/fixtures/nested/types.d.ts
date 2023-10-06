declare namespace nested {
  namespace deep {
    namespace deeper {
      type IListParams = { token?: string };
    }
  }

  namespace shallow {
    type ICreateParams = { name?: string };
  }
}

export default nested;
