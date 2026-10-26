import { products } from '@/data/catalog';
import { computeTotals } from '@/features/checkout/pricing';
import { selectCount, selectSubtotal, useCart } from '@/store/cart';

const negroni = products.find((p) => p.id === 'qa-negroni')!;
const croqueta = products.find((p) => p.id === 'qa-croqueta')!;
const otherBar = products.find((p) => p.barId === 'boteco-lume')!;

beforeEach(() => useCart.getState().clear());

describe('cart store', () => {
  it('soma quantidades do mesmo item e opção', () => {
    useCart.getState().add(negroni);
    useCart.getState().add(negroni, 2);
    expect(useCart.getState().lines).toHaveLength(1);
    expect(selectCount(useCart.getState())).toBe(3);
  });

  it('trata opções com acréscimo como linhas separadas e com preço próprio', () => {
    const rose = negroni.options!.find((o) => o.id === 'rose')!;
    useCart.getState().add(negroni);
    useCart.getState().add(negroni, 1, rose);
    expect(useCart.getState().lines).toHaveLength(2);
    expect(selectSubtotal(useCart.getState())).toBe(38 + 42);
  });

  it('substitui o carrinho ao adicionar item de outro bar', () => {
    useCart.getState().add(negroni);
    const { replaced } = useCart.getState().add(otherBar);
    expect(replaced).toBe(true);
    expect(useCart.getState().barId).toBe('boteco-lume');
    expect(useCart.getState().lines).toHaveLength(1);
  });

  it('remove a linha quando a quantidade chega a zero e limpa o bar', () => {
    useCart.getState().add(croqueta);
    useCart.getState().setQty('qa-croqueta', 0);
    expect(useCart.getState().lines).toHaveLength(0);
    expect(useCart.getState().barId).toBeNull();
  });
});

describe('computeTotals', () => {
  it('aplica cupom, taxa de serviço e cashback', () => {
    const t = computeTotals(
      [
        { qty: 1, unitPrice: 38 },
        { qty: 1, unitPrice: 34 },
      ],
      'budd10',
    );
    expect(t).toEqual({ subtotal: 72, discount: 7.2, serviceFee: 6.48, total: 71.28, cashback: 3.56 });
  });

  it('ignora cupom inválido', () => {
    expect(computeTotals([{ qty: 2, unitPrice: 10 }], 'NAOEXISTE').discount).toBe(0);
  });
});
