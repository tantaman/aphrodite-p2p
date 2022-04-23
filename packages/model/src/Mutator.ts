// export interface IMutationBuilder<M extends IModel<D>, D extends Object> {
//   toChangeset(options?: ChangesetOptions): Changeset<M, D>;
// }

// export interface ICreateOrUpdateBuilder<M extends IModel<D>, D extends Object>
//   extends IMutationBuilder<M, D> {
//   set(newData: Partial<D>): this;
// }

// // TODO: and if we want to enable transactions...
// abstract class MutationBuilder<M extends IModel<D>, D extends Object>
//   implements IMutationBuilder<M, D>
// {
//   constructor(protected spec: ModelSpec<M, D>, protected data: Partial<D>) {}
//   abstract toChangeset(): Changeset<M, D>;
// }
