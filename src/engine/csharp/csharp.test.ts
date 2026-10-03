import { describe, expect, it } from 'vitest'
import { compile } from './semantic'
import { checkRules } from './rules'

const codes = (src: string) => compile(src).diagnostics.filter((d) => d.severity === 'error').map((d) => d.code)

const TV = `
class Televizyon
{
    private int kanalNo = 1;
    private int sesSeviyesi;
    public string Marka { get; set; }
    public int SesSeviyesi
    {
        get { return sesSeviyesi; }
        set
        {
            if (value >= 0 && value <= 100)
                sesSeviyesi = value;
        }
    }
    public int KanalNo { get { return kanalNo; } }
    public void KanalDegistir(int kanalNo)
    {
        this.kanalNo = kanalNo;
    }
    public void KanalNoArtir() { kanalNo++; }
    public void KanalNoArtir(int artis) { kanalNo += artis; }
}

class Program
{
    static void Main(string[] args)
    {
        Televizyon tv = new Televizyon();
        tv.Marka = "Vestel";
        tv.KanalNoArtir();
        tv.KanalNoArtir(5);
        Console.WriteLine(tv.KanalNo);
        for (int i = 0; i < 3; i++)
        {
            tv.KanalNoArtir();
        }
    }
}
`

describe('C# denetleyici', () => {
  it('doğru kodu hatasız derler', () => {
    const r = compile(TV)
    expect(r.diagnostics).toEqual([])
    const tv = r.program.types.find((t) => t.name === 'Televizyon')!
    expect(tv.members.map((m) => m.kind + ':' + m.name)).toEqual([
      'field:kanalNo', 'field:sesSeviyesi', 'property:Marka', 'property:SesSeviyesi', 'property:KanalNo',
      'method:KanalDegistir', 'method:KanalNoArtir', 'method:KanalNoArtir',
    ])
  })

  it('eksik noktalı virgülü bulur', () => {
    const src = `class A { void M() { int x = 5\n x++; } }`
    const r = compile(src)
    expect(r.diagnostics[0]).toMatchObject({ code: 'CS1002', line: 1 })
    expect(codes('class A { int x }')).toContain('CS1002')
    expect(codes('class A { void M() { Console.WriteLine("a") } }')).toContain('CS1002')
  })

  it('kapanmamış parantezleri bulur', () => {
    expect(codes('class A { void M() { }')).toContain('CS1513')
  })

  it('private üyeye dışarıdan erişimi yakalar', () => {
    const src = `class A { private int x; }\nclass P { static void Main() { A a = new A(); a.x = 5; } }`
    expect(codes(src)).toEqual(['CS0122'])
  })

  it('olmayan üyeyi ve yanlış argüman sayısını yakalar', () => {
    const src = `class A { public void Yaz(int a) {} }\nclass P { static void Main() { var a = new A(); a.Yaz(); a.Ciz(); } }`
    expect(codes(src).sort()).toEqual(['CS1061', 'CS1501'])
  })

  it('salt okunur özelliğe atamayı yakalar', () => {
    const src = `class A { int k; public int K { get { return k; } } }\nclass P { static void Main() { A a = new A(); a.K = 3; } }`
    expect(codes(src)).toEqual(['CS0200'])
  })

  it('soyut sınıf ve arayüz kurallarını uygular', () => {
    expect(codes(`abstract class S { public abstract void Ciz(); }\nclass P { static void Main() { S s = new S(); } }`)).toContain('CS0144')
    expect(codes(`abstract class S { public abstract void Ciz(); }\nclass D : S { }`)).toContain('CS0534')
    expect(codes(`abstract class S { public abstract void Ciz(); }\nclass D : S { public override void Ciz() {} }`)).toEqual([])
    expect(codes(`interface IGuc { void GucAc(); }\nclass T : IGuc { }`)).toContain('CS0535')
    expect(codes(`interface IGuc { void GucAc(); }\nclass T : IGuc { void GucAc() {} }`)).toContain('CS0737')
    expect(codes(`class S { public abstract void Ciz(); }`)).toContain('CS0513')
  })

  it('kalıtım hatalarını yakalar', () => {
    expect(codes(`sealed class A {}\nclass B : A {}`)).toContain('CS0509')
    expect(codes(`class A {}\nclass B {}\nclass C : A, B {}`)).toContain('CS1721')
    expect(codes(`class A { public void M() {} }\nclass B : A { public override void M() {} }`)).toContain('CS0506')
    expect(codes(`class A { public A(int x) {} }\nclass B : A { public B() {} }`)).toContain('CS7036')
    expect(codes(`class A { public A(int x) {} }\nclass B : A { public B() : base(5) {} }`)).toEqual([])
    const w = compile(`class A { public virtual void M() {} }\nclass B : A { public void M() {} }`)
    expect(w.diagnostics.map((d) => d.code)).toEqual(['CS0114'])
    expect(w.ok).toBe(true)
  })

  it('static kurallarını uygular', () => {
    expect(codes(`class A { int x; static void M() { x = 5; } }`)).toContain('CS0120')
    expect(codes(`class A { public int x; }\nclass P { static void Main() { A.x = 3; } }`)).toContain('CS0120')
    expect(codes(`class A { public static int sayac; }\nclass P { static void Main() { A a = new A(); a.sayac = 3; } }`)).toContain('CS0176')
    expect(codes(`class A { public static int sayac; }\nclass P { static void Main() { A.sayac++; } }`)).toEqual([])
  })

  it('yapıcı metot hatalarını yakalar', () => {
    expect(codes(`class A { public A(int x) {} }\nclass P { static void Main() { A a = new A(); } }`)).toContain('CS1729')
    expect(codes(`class A { public void A() {} }`)).toContain('CS0542')
    expect(codes(`class A { public ~A() {} }`)).toContain('CS0106')
  })

  it('aşırı yükleme çakışmasını yakalar', () => {
    expect(codes(`class A { int T(int a) { return a; } double T(int b) { return b; } }`)).toContain('CS0111')
  })

  it('basit tür uyumsuzluklarını yakalar', () => {
    expect(codes(`class A { void M() { int x = "5"; } }`)).toContain('CS0029')
    expect(codes(`class A { void M() { int x = 3.2; } }`)).toContain('CS0266')
    expect(codes(`class A { void M() { char c = "a"; } }`)).toContain('CS0029')
    expect(codes(`class A { void M() { float f = 3.5; } }`)).toContain('CS0664')
    expect(codes(`class A { void M() { int sayi = textBox1.Text; } }`)).toContain('CS0029')
  })

  it('büyük/küçük harf hatalarını yakalar', () => {
    expect(codes(`class A { void M() { console.WriteLine("x"); } }`)).toContain('CS0103')
    expect(codes(`class A { void M() { Console.Writeline("x"); } }`)).toContain('CS0117')
  })

  it('üst düzey ifadeleri (top-level) analiz eder', () => {
    const src = `class A { private int x; }\nA a = new A();\na.x = 1;`
    expect(codes(src)).toEqual(['CS0122'])
  })

  it('görev kurallarını denetler', () => {
    const r = compile(TV)
    const res = checkRules(r, [
      { goal: 'sınıf', t: 'class', name: 'Televizyon' },
      { goal: 'alan', t: 'field', cls: 'Televizyon', name: 'kanalNo', type: 'int', access: 'private' },
      { goal: 'özellik', t: 'property', cls: 'Televizyon', name: 'KanalNo', get: true, set: false },
      { goal: 'aşırı', t: 'method', cls: 'Televizyon', name: 'KanalNoArtir', overloads: 2 },
      { goal: 'this', t: 'method', cls: 'Televizyon', name: 'KanalDegistir', params: ['int'], bodyHas: ['this.kanalNo = kanalNo;'] },
      { goal: 'new', t: 'new', type: 'Televizyon' },
      { goal: 'çağrı', t: 'call', member: 'KanalNoArtir', min: 2 },
      { goal: 'yanlış', t: 'property', cls: 'Televizyon', name: 'Marka', auto: false },
    ])
    expect(res.map((x) => x.ok)).toEqual([true, true, true, true, true, true, true, false])
  })
})
